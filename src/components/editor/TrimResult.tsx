type TrimResultProps = {
    url: string;
};

export default function TrimResult({ url }: TrimResultProps) {
    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Результат</h3>
            <video src={url} controls className="w-full rounded-lg shadow-md" />
            <a
                href={url}
                download={`trimmed-video-${Date.now()}.mp4`}
                className="block w-full text-center mt-3 bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
                Скачать результат
            </a>
        </div>
    );
}