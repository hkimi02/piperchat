import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import {
    setLocalStream,
    addRemoteStream,
    removeParticipant,
} from '@/slices/chatSlice';
import callService from '@/services/Call/callService';
import echo from '@/services/echo';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedChatroom, participants, localStream } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const peerConnections = useRef<{ [key: number]: RTCPeerConnection }>({});

    // Effect to get user media
    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                dispatch(setLocalStream(stream));
            } catch (error) {
                console.error('Could not get user media', error);
            }
        };

        getMedia();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                dispatch(setLocalStream(null));
            }
        };
    }, [dispatch]);

    // Effect to manage peer connections and signaling
    useEffect(() => {
        if (!localStream || !selectedChatroom || !currentUser) return;

        // Handle new participants
        participants.forEach(async (participant) => {
            if (participant.id !== currentUser.id && !peerConnections.current[participant.id]) {
                const pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnections.current[participant.id] = pc;

                localStream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, localStream));

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        callService.sendSignal(String(selectedChatroom.id), {
                            type: 'ice-candidate',
                            candidate: event.candidate,
                        });
                    }
                };

                pc.ontrack = (event) => {
                    dispatch(addRemoteStream({ userId: participant.id, stream: event.streams[0] }));
                };

                // Create offer for the new participant
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                callService.sendSignal(String(selectedChatroom.id), { type: 'offer', offer });
            }
        });

        // Listen for signaling events
        const signalingChannel = echo.join(`call.${selectedChatroom.id}`);

        // When a user leaves, clean up their peer connection
        signalingChannel.leaving((user: any) => {
            if (peerConnections.current[user.id]) {
                peerConnections.current[user.id].close();
                delete peerConnections.current[user.id];
            }
            dispatch(removeParticipant(user.id));
        });
        signalingChannel.listen('.SignalingEvent', async (data: any) => {
            const { from, type, offer, answer, candidate } = data.payload;
            const pc = peerConnections.current[from];

            if (!pc) return;

            try {
                if (type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const createdAnswer = await pc.createAnswer();
                    await pc.setLocalDescription(createdAnswer);
                    callService.sendSignal(String(selectedChatroom.id), { type: 'answer', answer: createdAnswer });
                } else if (type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } else if (type === 'ice-candidate') {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (error) {
                console.error('Signaling error:', error);
            }
        });

        // Cleanup on unmount
        return () => {
            signalingChannel.stopListening('.SignalingEvent');
            echo.leave(signalingChannel.name);
            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};
        };
    }, [localStream, participants, selectedChatroom, currentUser, dispatch]);
};
