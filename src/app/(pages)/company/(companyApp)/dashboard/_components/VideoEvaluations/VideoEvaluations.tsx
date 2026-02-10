"use client"

import { Video, Clock, ArrowRight, AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface VideoEvaluation {
    id: string; // vaga_avaliacao id
    vacancyUuid: string;
    cargo: string;
    candidato: {
        id: string;
        uuid?: string;
        nome: string;
        sobrenome: string;
        foto_perfil?: string | null;
        avatarUrl?: string | null;
    };
    submittedAt?: string;
    aiSuggestions?: string | string[];
}

interface VideoEvaluationsProps {
    evaluations: VideoEvaluation[];
}

export function VideoEvaluations({ evaluations }: VideoEvaluationsProps) {
    const { t, i18n } = useTranslation();

    if (!evaluations || evaluations.length === 0) return null;

    return (
        <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Video size={20} />
                </div>
                {t('dashboard_video_evaluations_title', 'Vídeos Pendentes de Avaliação')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluations.map((evalReq) => {
                    // Calcular prazo (7 dias após envio)
                    const submittedDate = evalReq.submittedAt ? new Date(evalReq.submittedAt) : new Date();
                    const deadlineDate = new Date(submittedDate);
                    deadlineDate.setDate(deadlineDate.getDate() + 7);

                    const now = new Date();
                    const diff = deadlineDate.getTime() - now.getTime();
                    const days = Math.ceil(diff / (1000 * 3600 * 24));
                    const isUrgent = days <= 2;

                    return (
                        <div key={evalReq.id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group
                            ${isUrgent ? 'border-red-200 ring-1 ring-red-100' : 'border-purple-200 hover:border-purple-300'}`}>

                            {/* Barra lateral de status */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${isUrgent ? 'bg-red-500' : 'bg-purple-500'}`} />

                            <div className="flex justify-between items-start mb-4 pl-2">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 relative overflow-hidden shrink-0 border border-slate-200">
                                        {evalReq.candidato.uuid ? (
                                            <Link href={`/viewer/candidate/${evalReq.candidato.uuid}`} className="w-full h-full relative block">
                                                {evalReq.candidato.foto_perfil || evalReq.candidato.avatarUrl ? (
                                                    <Image
                                                        src={evalReq.candidato.foto_perfil || evalReq.candidato.avatarUrl!}
                                                        alt={evalReq.candidato.nome}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <User size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                )}
                                            </Link>
                                        ) : (
                                            evalReq.candidato.foto_perfil || evalReq.candidato.avatarUrl ? (
                                                <Image
                                                    src={evalReq.candidato.foto_perfil || evalReq.candidato.avatarUrl!}
                                                    alt={evalReq.candidato.nome}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User size={20} />
                                            )
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-slate-900 line-clamp-1 text-sm leading-tight mb-0.5">
                                            {evalReq.candidato.nome} {evalReq.candidato.sobrenome}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                                            <span className="font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">{t('vacancy_label_uppercase', 'VAGA')}</span>
                                            {evalReq.cargo}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5 pl-2">
                                <p className="text-sm text-slate-600 mb-3 font-medium leading-relaxed">
                                    {t('dashboard_video_evaluation_desc', 'O candidato enviou o vídeo solicitado. Avalie agora!')}
                                </p>

                                <div className="flex flex-col gap-1.5">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg w-fit 
                                        ${isUrgent ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                                        {isUrgent ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                        <span>
                                            {t('dashboard_video_evaluation_deadline', 'Avaliar até:')} {deadlineDate.toLocaleDateString(i18n.language)}
                                        </span>
                                    </div>

                                    {isUrgent && (
                                        <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold animate-pulse">
                                            <AlertTriangle size={10} />
                                            {t('dashboard_video_suspension_warning', 'Risco de bloqueio da conta!')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/company/vacancies/${evalReq.vacancyUuid}/candidates`}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-bold transition-transform active:scale-[0.98] shadow-sm shadow-purple-200"
                            >
                                <Video size={16} />
                                {t('dashboard_evaluate_video_btn', 'Avaliar Vídeo')}
                                <ArrowRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
