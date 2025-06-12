import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import {
    setLocalStream,
    addRemoteStream,
    removeParticipant,
    updateParticipantStream,
    setScreenSharing,
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
    const {
        selectedChatroom,
        participants,
        localStream,
        isVideoEnabled,
        isScreenSharing,
    } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const peerConnections = useRef<{ [key: number]: RTCPeerConnection }>({});

    // Effect to manage local media stream (camera or screen share)
    useEffect(() => {
        const getMedia = async () => {
            try {
                const videoConstraints = isVideoEnabled ? { width: 1280, height: 720 } : false;
                let newStream;

                if (isScreenSharing) {
                    newStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    newStream.getVideoTracks()[0].onended = () => dispatch(setScreenSharing(false));
                } else {
                    newStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: videoConstraints });
                }

                if (localStream) {
                    localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                }

                dispatch(setLocalStream(newStream));
            } catch (error) {
                console.error('Could not get user media', error);
                if (isScreenSharing) {
                    dispatch(setScreenSharing(false));
                }
            }
        };

        if (selectedChatroom?.id) {
            getMedia();
        }
    }, [dispatch, isVideoEnabled, isScreenSharing, selectedChatroom?.id]);

    // Effect to manage peer connections and signaling
    useEffect(() => {
        if (!localStream || !selectedChatroom || !currentUser) {
            return;
        }

        const streamType = isScreenSharing ? 'screen' : (isVideoEnabled ? 'camera' : 'audio');
        callService.sendSignal(String(selectedChatroom.id), { type: 'stream-update', streamType });

        const signalingChannel = echo.join(`call.${selectedChatroom.id}`);

        participants.forEach(async (participant) => {
            if (participant.id === currentUser.id) return;

            let pc = peerConnections.current[participant.id];
            if (!pc) {
                pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnections.current[participant.id] = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        callService.sendSignal(String(selectedChatroom.id), { type: 'ice-candidate', candidate: event.candidate });
                    }
                };

                pc.ontrack = (event) => {
                    dispatch(addRemoteStream({ userId: participant.id, stream: event.streams[0] }));
                };

                localStream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, localStream));

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                callService.sendSignal(String(selectedChatroom.id), { type: 'offer', offer });
            } else {
                // Update tracks for existing connections
                const videoTrack = localStream.getVideoTracks()[0];
                const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                } else if (videoTrack) {
                    pc.addTrack(videoTrack, localStream);
                }
            }
        });

        signalingChannel.listen('.SignalingEvent', async (data: any) => {
            const { from, type, offer, answer, candidate, streamType } = data.payload;
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
                } else if (type === 'stream-update') {
                    dispatch(updateParticipantStream({ userId: from, streamType }));
                }
            } catch (error) {
                console.error('Signaling error:', error);
            }
        });

        signalingChannel.leaving((user: any) => {
            if (peerConnections.current[user.id]) {
                peerConnections.current[user.id].close();
                delete peerConnections.current[user.id];
            }
            dispatch(removeParticipant(user.id));
        });

        return () => {
            signalingChannel.stopListening('.SignalingEvent');
            echo.leave(signalingChannel.name);
        };
    }, [localStream, participants, selectedChatroom, currentUser, dispatch]);

    // Cleanup all connections on unmount
    useEffect(() => () => {
        Object.values(peerConnections.current).forEach(pc => pc.close());
        if (localStream) {
            localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
    }, [localStream]);
};
