"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Play, BrainCircuit, FileText, Activity, MessageSquare, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { markVideoAsViewed } from "../../../actions";

interface VideoAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    videoUrl: string;
    onFeedback?: () => void;
    showFeedbackButton?: boolean;
    candidateId?: string | number;
    vacancyUuid?: string;
    vacancyId?: string | number;
}

interface VideoAnalysisData {
    result: string;
    data: {
        id: number;
        videoUrl: string;
        position: string;
        requisites: string[];
        transcript: string;
        summary: string;
        communication: number;
        adherence: number;
        score: number;
        status: string;
        errorMessage: string | null;
        createdAt: string;
    }
}

export function VideoAnalysisModal({ isOpen, onClose, candidateName, videoUrl, onFeedback, showFeedbackButton = false, candidateId, vacancyUuid, vacancyId }: VideoAnalysisModalProps) {
    const { t } = useTranslation();
    const [data, setData] = useState<VideoAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchedUrl, setLastFetchedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            if (!data || lastFetchedUrl !== videoUrl) {
                setLoading(true);
                setError(null);

                if (candidateId && vacancyUuid) {
                    markVideoAsViewed(String(candidateId), vacancyUuid).catch(console.error);
                }

                fetch('/api/ai/video-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        videoUrl,
                        candidateId,
                        vacancyUuid,
                        vacancyId
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        setData(data);
                        setLastFetchedUrl(videoUrl);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        setError(`${t('video_analysis_error')} (${err instanceof Error ? err.message : String(err)})`);
                        setLoading(false);
                    });
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, videoUrl, data, lastFetchedUrl, candidateId, vacancyUuid, vacancyId]);

    const circularProgressStyle = useMemo(() => {
        if (!data) return {};
        const percentage = data.data.score;
        const color = '#3b82f6';
        return {
            background: `conic-gradient(${color} ${percentage * 3.6}deg, #e2e8f0 0deg)`
        };
    }, [data]);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{t('video_analysis_title', 'Análise Inteligente de Vídeo')}</h2>
                            <p className="text-sm text-gray-500">{t('candidate_label', 'Candidato')}: <span className="font-semibold text-slate-700">{candidateName}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-slate-200 rounded-xl aspect-video w-full"></div>
                                <div className="bg-white rounded-xl p-6 h-32 border border-slate-200"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white h-24 rounded-xl border border-slate-200"></div>
                                    <div className="bg-white h-24 rounded-xl border border-slate-200"></div>
                                </div>
                            </div>
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-white rounded-xl h-40 border border-slate-200"></div>
                                <div className="bg-white rounded-xl h-64 border border-slate-200"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center p-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
                            <p className="font-bold">{error}</p>
                            <button onClick={onClose} className="mt-4 text-sm underline">{t('video_modal_close', 'Fechar')}</button>
                        </div>
                    ) : data ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200 aspect-video relative group">
                                    {(data.data.videoUrl || videoUrl) ? (
                                        <video
                                            src={data.data.videoUrl || videoUrl}
                                            controls
                                            preload="metadata"
                                            className="w-full h-full object-contain"
                                            poster=""
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-6 text-center">
                                            <div className="bg-amber-100 p-4 rounded-full mb-4">
                                                <Activity size={32} className="text-amber-600" />
                                            </div>
                                            <h3 className="font-bold text-slate-700 mb-2">{t('video_expired_title', 'Vídeo Expirado')}</h3>
                                            <p className="text-sm max-w-xs">
                                                {t('video_expired_desc_company', 'O arquivo de vídeo foi removido após o período de expiração, mas a análise completa da IA foi preservada para sua consulta.')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t('overall_score', 'Score Geral')}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-800">{data.data.score}</span>
                                            <span className="text-sm text-slate-400">/100</span>
                                        </div>
                                        <div className={`mt-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md w-fit ${data.data.score >= 80 ? 'bg-green-100 text-green-700' :
                                            data.data.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            <Activity size={12} />
                                            {data.data.score >= 80 ? t('excellent_rating', 'Excelente') :
                                                data.data.score >= 60 ? t('good_rating', 'Bom') :
                                                    t('regular_rating', 'Regular')}
                                        </div>
                                    </div>

                                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={circularProgressStyle}>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="font-bold text-blue-600">{data.data.score}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquare size={16} className="text-purple-500" />
                                            <span className="text-xs font-bold text-slate-600 uppercase">{t('communication', 'Comunicação')}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 mb-2">{data.data.communication}%</div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.data.communication}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            <span className="text-xs font-bold text-slate-600 uppercase">{t('adherence', 'Aderência')}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 mb-2">{data.data.adherence}%</div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.data.adherence}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                        <BrainCircuit size={18} className="text-indigo-600" />
                                        <h3 className="font-bold text-slate-800">{t('candidate_summary', 'Resumo do Candidato')}</h3>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-slate-600 leading-relaxed text-sm text-justify">
                                            {data.data.summary}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[400px]">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 sticky top-0 bg-white z-10">
                                        <FileText size={18} className="text-slate-500" />
                                        <h3 className="font-bold text-slate-800">{t('full_transcript', 'Transcrição Completa')}</h3>
                                    </div>
                                    <div className="p-6 overflow-y-auto custom-scrollbar">
                                        <p className="text-slate-600 text-sm leading-7 whitespace-pre-wrap">
                                            {data.data.transcript}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {showFeedbackButton && onFeedback && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button
                            onClick={() => {
                                onFeedback();
                                onClose();
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
                        >
                            <MessageSquare size={18} />
                            {t('feedback_submit')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
