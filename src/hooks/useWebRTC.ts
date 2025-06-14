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
        // Google STUN servers (highly reliable)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },

        // Mozilla STUN servers
        { urls: 'stun:stun.services.mozilla.com:3478' },

        // Twilio STUN servers
        { urls: 'stun:global.stun.twilio.com:3478' },

        // OpenRelay STUN servers
        { urls: 'stun:openrelay.metered.ca:80' },
        { urls: 'stun:relay.metered.ca:80' },

        // Additional reliable servers
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.voiparound.com:3478' },
        { urls: 'stun:stun.voipbuster.com:3478' },
        { urls: 'stun:stun.voipstunt.com:3478' },
        { urls: 'stun:stun.voxgratia.org:3478' },
        { urls: 'stun:stun.xten.com:3478' },
        { urls: 'stun:stun.zoiper.com:3478' },

        // Your existing servers
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

        // Additional European servers
        { urls: 'stun:stun.freecall.com:3478' },
        { urls: 'stun:stun.freeswitch.org:3478' },
        { urls: 'stun:stun.gmx.de:3478' },
        { urls: 'stun:stun.gmx.net:3478' },
        { urls: 'stun:stun.internetcalls.com:3478' },
        { urls: 'stun:stun.ipfire.org:3478' },
        { urls: 'stun:stun.ippi.fr:3478' },
        { urls: 'stun:stun.iptel.org:3478' },
        { urls: 'stun:stun.lineafonica.net:3478' },
        { urls: 'stun:stun.linphone.org:3478' },
        { urls: 'stun:stun.liveo.fr:3478' },
        { urls: 'stun:stun.lowratevoip.com:3478' },
        { urls: 'stun:stun.lundimatin.fr:3478' },
        { urls: 'stun:stun.mit.de:3478' },
        { urls: 'stun:stun.miwifi.com:3478' },
        { urls: 'stun:stun.modulus.gr:3478' },
        { urls: 'stun:stun.myvoiptraffic.com:3478' },
        { urls: 'stun:stun.netappel.com:3478' },
        { urls: 'stun:stun.netgsm.com.tr:3478' },
        { urls: 'stun:stun.nfon.net:3478' },
        { urls: 'stun:stun.nonoh.net:3478' },
        { urls: 'stun:stun.ooma.com:3478' },
        { urls: 'stun:stun.ozekiphone.com:3478' },
        { urls: 'stun:stun.pjsip.org:3478' },
        { urls: 'stun:stun.poivy.com:3478' },
        { urls: 'stun:stun.powervoip.com:3478' },
        { urls: 'stun:stun.ppdi.com:3478' },
        { urls: 'stun:stun.qq.com:3478' },
        { urls: 'stun:stun.rackco.com:3478' },
        { urls: 'stun:stun.rockenstein.de:3478' },
        { urls: 'stun:stun.rolmail.net:3478' },
        { urls: 'stun:stun.rynga.com:3478' },
        { urls: 'stun:stun.schlund.de:3478' },
        { urls: 'stun:stun.sigmavoip.com:3478' },
        { urls: 'stun:stun.sip.us:3478' },
        { urls: 'stun:stun.sipdiscount.com:3478' },
        { urls: 'stun:stun.sipgate.net:10000' },
        { urls: 'stun:stun.sipgate.net:3478' },
        { urls: 'stun:stun.siplogin.de:3478' },
        { urls: 'stun:stun.sipnet.net:3478' },
        { urls: 'stun:stun.sipnet.ru:3478' },
        { urls: 'stun:stun.siportal.it:3478' },
        { urls: 'stun:stun.sippeer.dk:3478' },
        { urls: 'stun:stun.siptraffic.com:3478' },
        { urls: 'stun:stun.smartvoip.com:3478' },
        { urls: 'stun:stun.smsdiscount.com:3478' },
        { urls: 'stun:stun.snafu.de:3478' },
        { urls: 'stun:stun.solcon.nl:3478' },
        { urls: 'stun:stun.solnet.ch:3478' },
        { urls: 'stun:stun.sonetel.com:3478' },
        { urls: 'stun:stun.sonetel.net:3478' },
        { urls: 'stun:stun.sovtest.ru:3478' },
        { urls: 'stun:stun.speedy.com.ar:3478' },
        { urls: 'stun:stun.spokn.com:3478' },
        { urls: 'stun:stun.srce.hr:3478' },
        { urls: 'stun:stun.ssl7.net:3478' },
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.symform.com:3478' },
        { urls: 'stun:stun.symplicity.com:3478' },
        { urls: 'stun:stun.t-online.de:3478' },
        { urls: 'stun:stun.tagan.ru:3478' },
        { urls: 'stun:stun.tatn.ru:3478' },
        { urls: 'stun:stun.tel.lu:3478' },
        { urls: 'stun:stun.telbo.com:3478' },
        { urls: 'stun:stun.telefacil.com:3478' },
        { urls: 'stun:stun.tng.de:3478' },
        { urls: 'stun:stun.twt.it:3478' },
        { urls: 'stun:stun.u-blox.com:3478' },
        { urls: 'stun:stun.ucsb.edu:3478' },
        { urls: 'stun:stun.ucw.cz:3478' },
        { urls: 'stun:stun.uls.co.za:3478' },
        { urls: 'stun:stun.unseen.is:3478' },
        { urls: 'stun:stun.usfamily.net:3478' },
        { urls: 'stun:stun.veoh.com:3478' },
        { urls: 'stun:stun.vidyo.com:3478' },
        { urls: 'stun:stun.vipgroup.net:3478' },
        { urls: 'stun:stun.virtual-call.com:3478' },
        { urls: 'stun:stun.viva.gr:3478' },
        { urls: 'stun:stun.vivox.com:3478' },
        { urls: 'stun:stun.vline.com:3478' },
        { urls: 'stun:stun.voiceeclipse.net:3478' },
        { urls: 'stun:stun.voicetrading.com:3478' },
        { urls: 'stun:stun.voipblast.com:3478' },
        { urls: 'stun:stun.voipbuster.com:3478' },
        { urls: 'stun:stun.voipbusterpro.com:3478' },
        { urls: 'stun:stun.voipcheap.co.uk:3478' },
        { urls: 'stun:stun.voipcheap.com:3478' },
        { urls: 'stun:stun.voipfibre.com:3478' },
        { urls: 'stun:stun.voipgain.com:3478' },
        { urls: 'stun:stun.voipgate.com:3478' },
        { urls: 'stun:stun.voipinfocenter.com:3478' },
        { urls: 'stun:stun.voipplanet.nl:3478' },
        { urls: 'stun:stun.voippro.com:3478' },
        { urls: 'stun:stun.voipraider.com:3478' },
        { urls: 'stun:stun.voipstunt.com:3478' },
        { urls: 'stun:stun.voipwise.com:3478' },
        { urls: 'stun:stun.voipzoom.com:3478' },
        { urls: 'stun:stun.voys.nl:3478' },
        { urls: 'stun:stun.voztele.com:3478' },
        { urls: 'stun:stun.vyke.com:3478' },
        { urls: 'stun:stun.webcalldirect.com:3478' },
        { urls: 'stun:stun.whoi.edu:3478' },
        { urls: 'stun:stun.wifirst.net:3478' },
        { urls: 'stun:stun.wwdl.net:3478' },
        { urls: 'stun:stun.xs4all.nl:3478' },
        { urls: 'stun:stun.xtratelecom.es:3478' },
        { urls: 'stun:stun.yesss.at:3478' },
        { urls: 'stun:stun.zadarma.com:3478' },
        { urls: 'stun:stun.zadv.com:3478' },
        { urls: 'stun:stun.zoiper.com:3478' }
    ]
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
