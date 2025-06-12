import { useEffect, useRef } from 'react';

interface StreamPlayerProps {
    stream: MediaStream;
    isMuted?: boolean;
}

const StreamPlayer = ({ stream, isMuted = false }: StreamPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />;
};

export default StreamPlayer;
