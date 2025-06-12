import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { endCall, toggleVideo, setScreenSharing } from '@/slices/chatSlice';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff } from 'lucide-react';
import StreamPlayer from './StreamPlayer';
import { useWebRTC } from '@/hooks/useWebRTC';

const CallView = () => {
    useWebRTC(); // This hook manages all WebRTC logic

    const dispatch = useDispatch<AppDispatch>();
    const { participants, localStream, remoteStreams, isVideoEnabled, isScreenSharing } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(!isVideoEnabled);



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

    const toggleCamera = () => {
        dispatch(toggleVideo(!isVideoEnabled));
        setIsCameraOff(prev => !prev);
    };

    const toggleScreenShare = () => {
        dispatch(setScreenSharing(!isScreenSharing));
    };

    return (
        <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-between p-8 z-20">
            <div className="text-center">
                <h2 className="text-2xl font-bold">In Call</h2>
                <p className="text-muted-foreground">{participants.length} participant(s)</p>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Local Video Stream */}
                {localStream && (
                    <div className="relative bg-muted rounded-lg p-4 flex flex-col items-center justify-center aspect-video w-full">
                        <StreamPlayer stream={localStream} isMuted={true} />
                        <p className="absolute bottom-2 font-semibold text-white bg-black bg-opacity-50 px-2 rounded">You</p>
                    </div>
                )}

                {/* Remote Video Streams */}
                {participants
                    .filter(p => p.id !== currentUser?.id)
                    .map(p => (
                        <div key={p.id} className="relative bg-muted rounded-lg p-4 flex flex-col items-center justify-center aspect-video w-full">
                            {remoteStreams[p.id] ? (
                                <StreamPlayer stream={remoteStreams[p.id]} />
                            ) : (
                                <p>Connecting...</p>
                            )}
                            <p className="absolute bottom-2 font-semibold text-white bg-black bg-opacity-50 px-2 rounded">{p.full_name}</p>
                        </div>
                    ))}
            </div>

            <div className="flex gap-4">
                <Button onClick={toggleMute} variant="outline" size="icon" className="rounded-full w-12 h-12">
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleCamera} variant="outline" size="icon" className="rounded-full w-12 h-12">
                    {isCameraOff ? <VideoOff /> : <Video />}
                </Button>
                <Button onClick={toggleScreenShare} variant="outline" size="icon" className="rounded-full w-12 h-12">
                    {isScreenSharing ? <ScreenShareOff /> : <ScreenShare />}
                </Button>
                <Button onClick={handleEndCall} variant="destructive" size="icon" className="rounded-full w-16 h-16">
                    <PhoneOff />
                </Button>
            </div>
        </div>
    );
};

export default CallView;
