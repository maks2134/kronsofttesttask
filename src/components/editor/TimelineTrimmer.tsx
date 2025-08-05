import {useState, useEffect, useRef} from 'react';
import Image from "next/image";

type TimelineTrimmerProps = {
    thumbnails: string[];
    startTime: number;
    endTime: number;
    videoDuration: number;
    onStartTimeChange: (time: number) => void;
    onEndTimeChange: (time: number) => void;
};

const formatTime = (seconds: number): string => {

    return new Date(seconds * 1000).toISOString().substr(11, 8);
};

export default function TimelineTrimmer({
                                            thumbnails,
                                            startTime,
                                            endTime,
                                            videoDuration,
                                            onStartTimeChange,
                                            onEndTimeChange,
                                        }: TimelineTrimmerProps) {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);

    useEffect(() => {
        const handleMouseUp = () => setDraggingHandle(null);
        const handleMouseMove = (event: MouseEvent) => {
            if (!draggingHandle || !timelineRef.current || !videoDuration) return;
            const timelineRect = timelineRef.current.getBoundingClientRect();
            let newX = event.clientX - timelineRect.left;
            if (newX < 0) newX = 0;
            if (newX > timelineRect.width) newX = timelineRect.width;
            const newTime = (newX / timelineRect.width) * videoDuration;
            if (draggingHandle === 'start') {
                if (newTime < endTime) onStartTimeChange(newTime);
            } else {
                if (newTime > startTime) onEndTimeChange(newTime);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingHandle, startTime, endTime, videoDuration, onStartTimeChange, onEndTimeChange]);

    const startPercent = (startTime / videoDuration) * 100;
    const endPercent = (endTime / videoDuration) * 100;

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">2. Выберите диапазон</h3>
            <div ref={timelineRef} className="relative w-full h-auto select-none cursor-pointer">
                <div className="grid grid-cols-15 gap-0.5 border-2 border-slate-200 rounded-lg bg-slate-200 overflow-hidden">
                    {thumbnails.map((thumb, index) => (
                        <Image key={index} src={thumb} alt={`Кадр ${index}`} className="w-full h-auto" />
                    ))}
                </div>
                <div
                    className="absolute top-0 h-full bg-violet-500 bg-opacity-40 border-y-4 border-violet-600"
                    style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                ></div>
                <div
                    className="absolute top-0 -mt-1 w-4 h-[calc(100%+8px)] bg-violet-700 rounded cursor-ew-resize flex items-center justify-center shadow-lg"
                    style={{ left: `calc(${startPercent}% - 8px)` }}
                    onMouseDown={(e) => { e.preventDefault(); setDraggingHandle('start'); }}
                >
                    <div className="w-1 h-4 bg-white/80 rounded-full"></div>
                </div>
                <div
                    className="absolute top-0 -mt-1 w-4 h-[calc(100%+8px)] bg-violet-700 rounded cursor-ew-resize flex items-center justify-center shadow-lg"
                    style={{ left: `calc(${endPercent}% - 8px)` }}
                    onMouseDown={(e) => { e.preventDefault(); setDraggingHandle('end'); }}
                >
                    <div className="w-1 h-4 bg-white/80 rounded-full"></div>
                </div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
                <div className="font-mono bg-slate-100 px-3 py-1 rounded-md text-slate-600">Начало: <span className="font-semibold text-slate-800">{formatTime(startTime)}</span></div>
                <div className="font-mono bg-slate-100 px-3 py-1 rounded-md text-slate-600">Конец: <span className="font-semibold text-slate-800">{formatTime(endTime)}</span></div>
            </div>
        </div>
    );
}