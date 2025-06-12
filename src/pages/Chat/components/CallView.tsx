import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { endCall, setParticipants, addParticipant, removeParticipant } from '@/slices/chatSlice';
import echo from '@/services/echo';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { useWebRTC } from '@/hooks/useWebRTC';

const CallView = () => {
    useWebRTC(); // This hook manages all WebRTC logic

    const dispatch = useDispatch<AppDispatch>();
    const { selectedChatroom, participants, localStream, remoteStreams } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (selectedChatroom) {
            const channel = echo.join(`call.${selectedChatroom.id}`);

            channel
                .here((users: any[]) => {
                    dispatch(setParticipants(users));
                })
                .joining((user: any) => {
                    dispatch(addParticipant(user));
                })
                .leaving((user: any) => {
                    dispatch(removeParticipant(user.id));
                });

            return () => {
                echo.leave(`call.${selectedChatroom.id}`);
            };
        }
    }, [selectedChatroom, dispatch]);

    const handleEndCall = () => {
        dispatch(endCall());
    };

        const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    return (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-between p-8 z-20">
            <div className="text-center">
                <h2 className="text-2xl font-bold">In Call</h2>
                <p className="text-muted-foreground">{participants.length} participant(s)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map(p => (
                                        <div key={p.id} className="relative bg-muted rounded-lg p-4 flex flex-col items-center justify-center aspect-square w-48">
                        <p className="font-semibold">{p.id === currentUser?.id ? 'You' : p.full_name}</p>
                        {/* Audio element for remote streams */}
                        {p.id !== currentUser?.id && remoteStreams[p.id] && (
                            <AudioPlayer stream={remoteStreams[p.id]} />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <Button onClick={toggleMute} size="icon" variant="secondary" className="rounded-full h-14 w-14">
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button onClick={handleEndCall} size="icon" variant="destructive" className="rounded-full h-14 w-14">
                    <PhoneOff className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
};

export default CallView;
