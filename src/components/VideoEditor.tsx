"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import Uploader from "./editor/Uploader";
import VideoPlayer from "./editor/VideoPlayer";
import TimelineTrimmer from "./editor/TimelineTrimmer";
import TrimResult from "./editor/TrimResult";

export default function VideoEditor() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [trimmedVideoURL, setTrimmedVideoURL] = useState<string | null>(null);
    const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("Загрузите FFmpeg, чтобы начать.");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const loadFfmpeg = async () => {
        setMessage("Загрузка ffmpeg-core.js...");
        const ffmpegInstance = new FFmpeg();
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpegInstance.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        setFfmpeg(ffmpegInstance);
        setMessage("Видео загржуено");
    };

    useEffect(() => {
        loadFfmpeg();
    }, []);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoSrc(URL.createObjectURL(file));
            setTrimmedVideoURL(null);
            setThumbnails([]);
            setStartTime(0);
            setEndTime(0);
        }
    };

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            setVideoDuration(duration);
            setEndTime(duration);
            generateThumbnails(duration);
        }
    };

    const generateThumbnails = (duration: number) => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const numThumbnails = 15;
        const interval = duration / numThumbnails;
        const tempThumbnails: string[] = [];
        let generatedCount = 0;

        const captureFrame = () => {
            if (generatedCount < numThumbnails) video.currentTime = generatedCount * interval;
        };

        video.onseeked = () => {
            if (generatedCount < numThumbnails && video.currentTime <= duration) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                tempThumbnails.push(canvas.toDataURL("image/jpeg"));
                generatedCount++;
                setThumbnails([...tempThumbnails]);
                captureFrame();
            } else {
                video.onseeked = null;
            }
        };
        captureFrame();
    };

    const handleTrim = async () => {
        if (!ffmpeg || !videoFile) {
            setMessage("FFmpeg не загружен или видео не выбрано.");
            return;
        }

        setIsProcessing(true);
        setTrimmedVideoURL(null);
        setMessage("Подготовка... Запись файла в память FFmpeg.");

        await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
        setMessage(`Начало обрезки...`);

        await ffmpeg.exec(["-i", "input.mp4", "-ss", String(startTime), "-to", String(endTime), "-c", "copy", "output.mp4"]);

        setMessage("Чтение результата...");
        const data = await ffmpeg.readFile("output.mp4");

        if (data instanceof Uint8Array) {
            const url = URL.createObjectURL( new Blob([data.buffer as unknown as ArrayBuffer], { type: "video/mp4" }));
            setTrimmedVideoURL(url);
            setMessage("Обрезка завершена!");
        } else {
            setMessage("Произошла ошибка при чтении обработанного файла.");
        }
        setIsProcessing(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col space-y-4">
                    <Uploader onFileChange={handleFileChange} />

                    {videoSrc && (
                        <>
                            <VideoPlayer
                                src={videoSrc}
                                videoRef={videoRef}
                                onLoadedMetadata={handleVideoLoaded}
                            />

                            {thumbnails.length > 0 && (
                                <div className="mt-4">
                                    <TimelineTrimmer
                                        thumbnails={thumbnails}
                                        startTime={startTime}
                                        endTime={endTime}
                                        videoDuration={videoDuration}
                                        onStartTimeChange={setStartTime}
                                        onEndTimeChange={setEndTime}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {videoSrc && (
                        <div>
                            <button
                                onClick={handleTrim}
                                disabled={isProcessing || !ffmpeg}
                                className="w-full bg-violet-600 text-white px-4 py-3 rounded-lg disabled:bg-gray-400 hover:bg-violet-700 transition-colors font-semibold"
                            >
                                {isProcessing ? "Идет обработка..." : "Обрезать видео"}
                            </button>
                            <p className="text-center text-sm text-gray-600 mt-2">{message}</p>
                        </div>
                    )}
                </div>

                {trimmedVideoURL && (
                    <div className="flex flex-col space-y-4">
                        <TrimResult url={trimmedVideoURL} />
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} className="hidden" width="160" height="90"></canvas>
        </div>
    );
}