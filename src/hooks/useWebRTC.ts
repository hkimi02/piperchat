import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import {
    setLocalStream,
    addRemoteStream,
    removeParticipant,
    updateParticipantStream,
    setScreenSharing,
    setParticipants,
    addParticipant,
} from '@/slices/chatSlice';
import callService from '@/services/Call/callService';
import echo from '@/services/echo';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:23.21.150.121:3478' },
        { urls: 'stun:iphone-stun.strato-iphone.de:3478' },
        { urls: 'stun:numb.viagenie.ca:3478' },
        { urls: 'stun:s1.taraba.net:3478' },
        { urls: 'stun:s2.taraba.net:3478' },
        { urls: 'stun:stun.12connect.com:3478' },
        { urls: 'stun:stun.12voip.com:3478' },
        { urls: 'stun:stun.3clogic.com:3478' },
        { urls: 'stun:stun.3cx.com:3478' },
        { urls: 'stun:stun.a-mm.tv:3478' },
        { urls: 'stun:stun.aa.net.uk:3478' },
        { urls: 'stun:stun.acrobits.cz:3478' },
        { urls: 'stun:stun.actionvoip.com:3478' },
        { urls: 'stun:stun.advfn.com:3478' },
        { urls: 'stun:stun.aeta-audio.com:3478' },
        { urls: 'stun:stun.aeta.com:3478' },
        { urls: 'stun:stun.alltel.com.au:3478' },
        { urls: 'stun:stun.altar.com.pl:3478' },
        { urls: 'stun:stun.annatel.net:3478' },
        { urls: 'stun:stun.antisip.com:3478' },
        { urls: 'stun:stun.arbuz.ru:3478' },
        { urls: 'stun:stun.avigora.com:3478' },
        { urls: 'stun:stun.avigora.fr:3478' },
        { urls: 'stun:stun.awa-shima.com:3478' },
        { urls: 'stun:stun.awt.be:3478' },
        { urls: 'stun:stun.b2b2c.ca:3478' },
        { urls: 'stun:stun.bahnhof.net:3478' },
        { urls: 'stun:stun.barracuda.com:3478' },
        { urls: 'stun:stun.bluesip.net:3478' },
        { urls: 'stun:stun.bmwgs.cz:3478' },
        { urls: 'stun:stun.botonakis.com:3478' },
        { urls: 'stun:stun.budgetphone.nl:3478' },
        { urls: 'stun:stun.budgetsip.com:3478' },
        { urls: 'stun:stun.cablenet-as.net:3478' },
        { urls: 'stun:stun.callromania.ro:3478' },
        { urls: 'stun:stun.callwithus.com:3478' },
        { urls: 'stun:stun.cbsys.net:3478' },
        { urls: 'stun:stun.chathelp.ru:3478' },
        { urls: 'stun:stun.cheapvoip.com:3478' },
        { urls: 'stun:stun.ciktel.com:3478' },
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
    const signalingChannel = useRef<any>(null);

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

    // Memoized handler for signaling events to avoid stale closures
    const handleSignalingEvent = useCallback(async (data: any) => {
        
        // The `from` ID is added by the presence channel, the rest is in the event's public $payload property.
        const { payload } = data; // The data object from Laravel contains the event's public properties.
        const { from, type, offer, answer, candidate, streamType } = payload; // The actual signal is nested in the 'payload' property.

        if (type === 'answer') {
            const pc = peerConnections.current[from];
            if (pc) {
                                if (answer.sdp && !answer.sdp.endsWith('\r\n')) {
                    answer.sdp += '\r\n';
                }
                await pc.setRemoteDescription(answer);
            }
        } else if (type === 'ice-candidate') {
            const pc = peerConnections.current[from];
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } else if (type === 'offer') {
            let pc = peerConnections.current[from];
            if (!pc) {
                pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnections.current[from] = pc;

                

                

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        callService.sendSignal(String(selectedChatroom!.id), { type: 'ice-candidate', candidate: event.candidate });
                    }
                };
        
                pc.ontrack = (event) => {
                    dispatch(addRemoteStream({ userId: from, stream: event.streams[0] }));
                };
        
                if (localStream) {
                    localStream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, localStream));
                }
            }

            if (offer.sdp && !offer.sdp.endsWith('\r\n')) {
                offer.sdp += '\r\n';
            }
            await pc.setRemoteDescription(offer);
            const createdAnswer = await pc.createAnswer();
            await pc.setLocalDescription(createdAnswer);
            callService.sendSignal(String(selectedChatroom!.id), { type: 'answer', answer: createdAnswer });
        } else if (type === 'stream-update') {
            dispatch(updateParticipantStream({ userId: from, streamType }));
        }
    }, [localStream, selectedChatroom, dispatch]);

    // Effect for WebSocket channel management
    useEffect(() => {
        // Wait for local stream before joining the signaling channel to avoid race conditions
        if (!localStream || !selectedChatroom || !currentUser) {
            return;
        }

        const channelName = `call.${selectedChatroom.id}`;
        const channel = echo.join(channelName);
        signalingChannel.current = channel;

        channel.here((users: any[]) => {
            dispatch(setParticipants(users));
        });

        channel.joining((user: any) => {
            dispatch(addParticipant(user));
        });

        channel.leaving((user: any) => {
            if (peerConnections.current[user.id]) {
                peerConnections.current[user.id].close();
                delete peerConnections.current[user.id];
            }
            dispatch(removeParticipant(user.id));
        });

        channel.listen('.signal', handleSignalingEvent);

        return () => {
            echo.leave(channelName);
            signalingChannel.current = null;
        };
    }, [selectedChatroom, currentUser, dispatch, handleSignalingEvent, localStream]);

    // Effect for initiating connections to new participants
    useEffect(() => {
        if (!localStream || !selectedChatroom || !currentUser) return;

        const newParticipants = participants.filter(p => p.id !== currentUser.id && !peerConnections.current[p.id]);

        newParticipants.forEach(async (participant) => {
            // To prevent glare, only the user with the lower ID initiates the connection.
            if (currentUser.id < participant.id) {
                const pc = new RTCPeerConnection(ICE_SERVERS);
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
            }
        });
    }, [participants, localStream, selectedChatroom, currentUser, dispatch]);

    // Effect to send stream updates when media type changes
    useEffect(() => {
        if (localStream) {
            const streamType = isScreenSharing ? 'screen' : (isVideoEnabled ? 'camera' : 'audio');
            callService.sendSignal(String(selectedChatroom!.id), { type: 'stream-update', streamType });
        }
    }, [localStream, isVideoEnabled, isScreenSharing, selectedChatroom]);
};
