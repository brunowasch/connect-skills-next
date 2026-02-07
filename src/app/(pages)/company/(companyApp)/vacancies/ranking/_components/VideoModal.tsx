"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    videoUrl: string | null | undefined;
}

export function VideoModal({ isOpen, onClose, candidateName, videoUrl }: VideoModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{t('video_modal_title', 'Vídeo de Apresentação')}</h2>
                        <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/5">
                    {!videoUrl ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">{t('video_modal_no_video', 'Vídeo não disponível')}</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-full"
                                autoPlay
                            >
                                {t('video_modal_browser_support', 'Seu navegador não suporta a visualização de vídeos.')}
                            </video>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                        {t('video_modal_close', 'Fechar')}
                    </button>
                </div>
            </div>
        </div>
    );
}
