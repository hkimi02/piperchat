import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { endCall, toggleVideo, setScreenSharing } from '@/slices/chatSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Video, VideoOff, ScreenShare } from 'lucide-react';
import StreamPlayer from './StreamPlayer';
import { useWebRTC } from '@/hooks/useWebRTC';

const CallView = () => {
    useWebRTC(); // This hook manages all WebRTC logic

    const dispatch = useDispatch<AppDispatch>();
    const { participants, localStream, remoteStreams, isVideoEnabled, isScreenSharing } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);

    const [isMuted, setIsMuted] = useState(false);
    const [pinnedUserId, setPinnedUserId] = useState<number | null>(null);

    const remoteParticipants = participants.filter(p => p.id !== currentUser?.id);

    // Effect to manage the pinned user
    useEffect(() => {
        // If no one is pinned and there are remote participants, pin the first one.
        if (pinnedUserId === null && remoteParticipants.length > 0) {
            setPinnedUserId(remoteParticipants[0].id);
        } 
        // If the pinned user has left the call, pin the next available user or clear.
        else if (pinnedUserId !== null && !remoteParticipants.some(p => p.id === pinnedUserId)) {
            setPinnedUserId(remoteParticipants.length > 0 ? remoteParticipants[0].id : null);
        }
    }, [participants, pinnedUserId, remoteParticipants]);

    const pinnedStream = pinnedUserId ? remoteStreams[pinnedUserId] : null;
    const pinnedParticipant = participants.find(p => p.id === pinnedUserId);

    const handleEndCall = () => dispatch(endCall());

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track: MediaStreamTrack) => track.enabled = !track.enabled);
            setIsMuted(prev => !prev);
        }
    };

    const toggleCamera = () => dispatch(toggleVideo(!isVideoEnabled));
    const toggleScreenShare = () => dispatch(setScreenSharing(!isScreenSharing));

    return (
        <div className="absolute inset-0 bg-background text-foreground flex flex-col z-20">
            {/* Main View for Pinned Stream */}
            <div className="flex-1 flex items-center justify-center p-4 relative bg-muted/40">
                {pinnedStream ? (
                    <StreamPlayer stream={pinnedStream} />
                ) : pinnedParticipant ? (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Avatar className="w-32 h-32">
                            <AvatarFallback className="text-5xl">
                                {pinnedParticipant.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-xl text-muted-foreground">Connecting to {pinnedParticipant.full_name}...</p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <h2 className="text-2xl font-bold">Call in Progress</h2>
                        <p>
                            {remoteParticipants.length === 0 
                                ? "Waiting for others to join..." 
                                : "Select a participant to view their stream."}
                        </p>
                    </div>
                )}
                {pinnedParticipant && (
                    <p className="absolute top-4 left-4 text-lg font-semibold bg-card/80 text-card-foreground px-3 py-1 rounded">
                        {pinnedParticipant.full_name}
                    </p>
                )}
            </div>

            {/* Thumbnail Strip */}
            <div className="bg-accent p-2 flex justify-center items-center gap-4 h-40">
                {remoteParticipants.map(p => (
                    <div key={p.id} 
                         className={`relative w-48 h-32 bg-muted rounded-lg cursor-pointer overflow-hidden transition-all duration-300 ${pinnedUserId === p.id ? 'border-4 border-primary' : 'border-2 border-transparent'}`}
                         onClick={() => setPinnedUserId(p.id)}>
                        {remoteStreams[p.id] ? (
                            <StreamPlayer stream={remoteStreams[p.id]} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Avatar className="w-16 h-16">
                                    <AvatarFallback className="text-2xl">
                                        {p.full_name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                        <p className="absolute bottom-1 left-1 text-sm font-semibold bg-card/80 text-card-foreground px-2 rounded">{p.full_name}</p>
                    </div>
                ))}
            </div>

            {/* Local Stream Preview (Fixed) */}
            {localStream && (
                <div className="absolute top-4 right-4 w-48 h-32 bg-muted rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                     <StreamPlayer stream={localStream} isMuted={true} />
                     <p className="absolute bottom-1 left-1 text-sm font-semibold bg-card/80 text-card-foreground px-2 rounded">You</p>
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 p-4 bg-background">
                <Button onClick={toggleMute} variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleCamera} variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>
                <Button onClick={toggleScreenShare} variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    {isScreenSharing ? <ScreenShare className="text-primary"/> : <ScreenShare />}
                </Button>
                <Button onClick={handleEndCall} variant="destructive" size="icon" className="rounded-full w-16 h-12">
                    <PhoneOff />
                </Button>
            </div>
        </div>
    );
};

export default CallView;
