import VideoEditor from "@/components/VideoEditor";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
            <div className="w-full max-w-6xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
                        Violet Video Editor
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Загрузите, обрежьте и скачайте ваше видео с легкостью.
                    </p>
                </div>
                <VideoEditor />
            </div>
        </main>
    );
}