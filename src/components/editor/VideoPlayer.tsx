import { RefObject } from "react";

type VideoPlayerProps = {
    src: string;
    videoRef: RefObject<HTMLVideoElement | null>;
    onLoadedMetadata: () => void;
};

export default function VideoPlayer({ src, videoRef, onLoadedMetadata }: VideoPlayerProps) {
    return (
        <div>
            <video
                ref={videoRef}
                src={src}
                controls
                className="w-full rounded-lg shadow-md"
                onLoadedMetadata={onLoadedMetadata}
            />
        </div>
    );
}