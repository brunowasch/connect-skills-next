"use client";

import { useState, useRef, useEffect } from "react";
import { Square, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VideoRecorderProps {
    onRecordingComplete: (file: File) => void;
    onCancel: () => void;
}

export function VideoRecorder({ onRecordingComplete, onCancel }: VideoRecorderProps) {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const mimeTypeRef = useRef<string>("video/webm");
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [timeLeft, setTimeLeft] = useState(180);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        }
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(t('camera_access_error', 'Não foi possível acessar a câmera e o microfone. Verifique suas permissões.'));
        }
    };

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mimeTypeRef.current = mediaRecorder.mimeType || "video/webm";

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
            const file = new File([blob], `recorded-video.${mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'}`, { type: mimeTypeRef.current });

            setIsRecording(false);
            setTimeLeft(180);
            chunksRef.current = [];

            onRecordingComplete(file);
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
        setTimeLeft(180);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={startCamera} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                        {t('try_again', 'Tentar Novamente')}
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        {t('cancel', 'Cancelar')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="relative aspect-video bg-slate-900">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-sm font-mono border border-white/10">
                    <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <button
                    onClick={onCancel}
                    disabled={isRecording}
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 disabled:opacity-50 cursor-pointer"
                >
                    {t('cancel', 'Cancelar')}
                </button>

                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`
                        w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer
                        ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-white hover:bg-gray-100'}
                    `}
                >
                    {isRecording ? (
                        <Square className="fill-white text-white" size={20} />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-red-500" />
                    )}
                </button>

                <div className="w-[70px]" />
            </div>
        </div>
    );
}
