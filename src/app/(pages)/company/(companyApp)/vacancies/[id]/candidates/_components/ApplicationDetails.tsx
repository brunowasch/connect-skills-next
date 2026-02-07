"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Clock,
    AlertCircle,
    CheckCircle2,
    BrainCircuit,
    MessageSquareText,
    TrendingUp,
    Lightbulb,
    Video,
    Loader2,
    Play
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { requestVideo } from "../../../actions";

interface ApplicationDetailsProps {
    application: any;
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRequestVideo = () => {
        if (!application?.candidato_id || !application?.vaga_id) return;

        startTransition(async () => {
            const result = await requestVideo(application.candidato_id, application.vaga_id);
            if (result.success) {
                toast.success("Solicitação de vídeo enviada com sucesso!");
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao solicitar vídeo");
            }
        });
    };

    if (!application || !application.resposta) return null;

    let respostaData: any = {};
    let breakdownData: any = {};

    try {
        respostaData = JSON.parse(application.resposta);
        breakdownData = application.breakdown ? JSON.parse(application.breakdown) : {};
    } catch (e) {
        console.error("Erro ao processar dados da aplicação:", e);
    }

    const duration = respostaData.metrics?.duration || 0;
    const penalties = respostaData.metrics?.penalties || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const discScores = [
        { label: t('disc_dominance'), score: breakdownData.d_score || 0, color: 'bg-red-500' },
        { label: t('disc_influence'), score: breakdownData.i_score || 0, color: 'bg-yellow-400' },
        { label: t('disc_stability'), score: breakdownData.s_score || 0, color: 'bg-green-500' },
        { label: t('disc_compliance'), score: breakdownData.c_score || 0, color: 'bg-blue-500' },
    ];

    return (
        <div className="w-full mt-4 border-t border-gray-100 pt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isOpen ? t('application_details_hide') : t('application_details_show')}
            </button>

            {isOpen && (
                <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Seção de Vídeo */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Video size={100} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Video size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Vídeo de Apresentação</h4>
                            </div>

                            {!breakdownData.video?.status && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Solicitar vídeo de apresentação</p>
                                        <p className="text-xs text-gray-500 mt-1">O candidato receberá um email solicitando o envio de um vídeo de até 3 minutos.</p>
                                    </div>
                                    <button
                                        onClick={handleRequestVideo}
                                        disabled={isPending}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Video size={16} />
                                                Solicitar Vídeo
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {breakdownData.video?.status === 'requested' && (
                                <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800">
                                    <Clock size={20} className="shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">Aguardando envio</p>
                                        <p className="text-xs opacity-90">Solicitação enviada em {new Date(breakdownData.video.requestedAt).toLocaleDateString()} às {new Date(breakdownData.video.requestedAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            )}

                            {breakdownData.video?.status === 'submitted' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <CheckCircle2 size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Vídeo Recebido</span>
                                    </div>
                                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-2xl border border-gray-200 shadow-sm">
                                        <video
                                            src={breakdownData.video.url}
                                            controls
                                            className="w-full h-full"
                                            poster={breakdownData.video.thumbnail}
                                        >
                                            Seu navegador não suporta a tag de vídeo.
                                        </video>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Enviado em {new Date(breakdownData.video.submittedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resumo da IA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Scores DISC */}
                        <div className="md:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
                                <TrendingUp size={18} className="text-blue-500" />
                                {t('application_details_disc_profile')}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {discScores.map((item) => (
                                    <div key={item.label} className="text-center">
                                        <div className="relative w-16 h-16 mx-auto mb-3">
                                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                                <path
                                                    className="text-slate-200"
                                                    strokeDasharray="100, 100"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    className={item.color.replace('bg-', 'text-')}
                                                    strokeDasharray={`${item.score}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                />
                                                <text x="18" y="21" className="text-[8px] font-bold" textAnchor="middle" fill="currentColor">{item.score}%</text>
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Métricas de Tempo */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                            <h4 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-400">
                                <Clock size={18} />
                                {t('application_details_metrics')}
                            </h4>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">{t('application_details_total_time')}</p>
                                    <p className="text-2xl font-bold">{minutes}m {seconds}s</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">{t('application_details_screen_exits')}</p>
                                    <p className={`text-2xl font-bold ${penalties > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {penalties} {penalties === 1 ? t('application_details_time') : t('application_details_times')}
                                    </p>
                                </div>
                            </div>
                            <Clock className="absolute -bottom-4 -right-4 text-white opacity-5 w-24 h-24" />
                        </div>
                    </div>

                    {/* Motivo e Sugestões */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <BrainCircuit size={18} />
                                {t('application_details_behavioral_analysis')}
                            </h4>
                            <p className="text-sm text-blue-900 leading-relaxed italic">
                                "{breakdownData.reason || t('application_details_no_analysis')}"
                            </p>

                            {/* Matched Skills */}
                            {breakdownData.matchedSkills && breakdownData.matchedSkills.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">{t('application_details_skills_identified')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {breakdownData.matchedSkills.map((skill: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-white/50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                            <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Lightbulb size={18} />
                                {t('application_details_improvement_suggestions')}
                            </h4>
                            {Array.isArray(breakdownData.suggestions) ? (
                                <ul className="space-y-2">
                                    {breakdownData.suggestions.map((s: string, i: number) => (
                                        <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-emerald-900 leading-relaxed">
                                    {breakdownData.suggestions || t('application_details_no_suggestions')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Respostas Detalhadas */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                            <MessageSquareText size={18} className="text-slate-500" />
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t('application_details_interview_answers')}</h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {(() => {
                                const responses = Array.isArray(respostaData) ? respostaData : (respostaData.responses || []);

                                if (responses.length === 0) {
                                    return (
                                        <div className="p-12 text-center text-gray-500 italic">
                                            {t('application_details_no_detailed_answers')}
                                        </div>
                                    );
                                }

                                return responses.map((resp: any, idx: number) => (
                                    <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start gap-4 mb-3">
                                            <span className="shrink-0 w-6 h-6 rounded bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{resp.question || t('application_details_untitled_question')}</p>
                                        </div>
                                        <div className="ml-10 bg-white p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed shadow-sm whitespace-pre-wrap">
                                            {resp.answer || t('application_details_no_answer')}
                                        </div>
                                        <div className="ml-10 mt-3 flex gap-2">
                                            {resp.category && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-400 border border-slate-200">
                                                    {resp.category}
                                                </span>
                                            )}
                                            {resp.method && resp.method !== "N/A" && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-400 border border-blue-100">
                                                    {resp.method}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
