import { ChangeEvent } from "react";

type UploaderProps = {
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function Uploader({ onFileChange }: UploaderProps) {
    return (
        <div className="p-4 border border-slate-200 rounded-xl bg-white/50">
            <label className="block text-lg font-semibold text-slate-700 mb-2">
                1. Загрузите видео
            </label>
            <input
                type="file"
                accept="video/*"
                onChange={onFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 transition-colors cursor-pointer"
            />
        </div>
    );
}