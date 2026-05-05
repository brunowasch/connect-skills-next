"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { Calendar, Clock, Building2, CheckCircle, XCircle, AlertTriangle, ChevronRight, Timer, History, Video, MapPin, Star, TrendingDown, Activity, TrendingUp, Globe, Brain } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import MentorReviewModal from "./MentorReviewModal";

const getScoreStyle = (score: number) => {
    if (score < 50) return {
        bg: "bg-red-50 border-red-200 text-red-700",
        icon: <TrendingDown size={12} />
    };
    if (score < 70) return {
        bg: "bg-orange-50 border-orange-200 text-orange-700",
        icon: <Activity size={12} />
    };
    return {
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        icon: <TrendingUp size={12} />
    };
};

function useCountdown(criado_em: string) {
    const EXPIRATION_MS = 3 * 24 * 60 * 60 * 1000;

    const getRemaining = () => {
        const deadline = new Date(new Date(criado_em).getTime() + EXPIRATION_MS);
        const diff = deadline.getTime() - Date.now();
        if (diff <= 0) return null;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { days, hours, minutes, isUrgent: diff < 12 * 60 * 60 * 1000 };
    };

    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        const interval = setInterval(() => setRemaining(getRemaining()), 60_000);
        return () => clearInterval(interval);
    }, [criado_em]);

    return remaining;
}

function CountdownChip({ criado_em }: { criado_em: string }) {
    const { t } = useTranslation();
    const remaining = useCountdown(criado_em);

    if (!remaining) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] sm:text-[11px] font-semibold w-fit">
                <AlertTriangle size={12} className="flex-shrink-0" />
                {t("interview_countdown_expired", "Convite Expirado")}
            </div>
        );
    }

    const { days, hours, minutes, isUrgent } = remaining;
    const colorClass = isUrgent
        ? "bg-red-50 border-red-200 text-red-700"
        : days === 0
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-blue-50 border-blue-200 text-blue-700";

    const label = days > 0
        ? t("interview_countdown_expires_days", { defaultValue: "Expira em {{days}}d {{hours}}h", days, hours })
        : t("interview_countdown_expires_hours", { defaultValue: "Expira em {{hours}}h {{minutes}}m", hours, minutes });

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] sm:text-[11px] font-semibold w-fit ${colorClass}`}>
            <Timer size={12} className={`flex-shrink-0 ${isUrgent ? "animate-pulse" : ""}`} />
            {label}
        </div>
    );
}

export default function CandidateInterviewsClient({
    interviews,
    mentorshipReviews = [],
    candidateName = "Candidato",
}: {
    interviews: any[];
    mentorshipReviews?: any[];
    candidateName?: string;
}) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<'scheduled' | 'history' | 'pending' | 'reviews'>('scheduled');
    const [filterType, setFilterType] = useState<'all' | 'empresas' | 'mentores'>('all');
    const [selectedReview, setSelectedReview] = useState<any | null>(null);

    const processedInterviews = interviews.map(m => {
        let isMeetingExpired = false;

        if (m.status === 'CONCLUIDA') {
            isMeetingExpired = true;
        } else if (m.data) {
            const [year, month, day] = m.data.split("-");
            
            const timeToUse = m.hora_fim || m.hora_inicio;

            if (timeToUse && year && month && day) {
                const [h, min] = timeToUse.split(":");
                if (h && min) {
                    const endData = new Date(Number(year), Number(month) - 1, Number(day), Number(h), Number(min), 0);
                    const expirationTime = m.hora_fim ? endData.getTime() : endData.getTime() + (60 * 60 * 1000);
                    
                    if (Date.now() > expirationTime) {
                        isMeetingExpired = true;
                    }
                }
            }

            if (m.candidato_compareceu) {
                isMeetingExpired = true;
            }
        }
        return { ...m, isMeetingExpired };
    });

    const typeFilter = (m: any) =>
        filterType === 'all' ||
        (filterType === 'empresas' && m.type === 'presencial') ||
        (filterType === 'mentores' && m.type === 'online');

    const scheduled = processedInterviews.filter(m => m.status === 'CONFIRMADA' && !m.isMeetingExpired && typeFilter(m));
    const pending = processedInterviews.filter(m => m.status === 'PENDENTE_CANDIDATO' && !m.isMeetingExpired && typeFilter(m));
    const history = processedInterviews.filter(m => (!['CONFIRMADA', 'PENDENTE_CANDIDATO'].includes(m.status) || m.isMeetingExpired) && typeFilter(m));

    const renderCard = (m: any) => {
        const isScheduled = activeTab === 'scheduled';
        const isPending = activeTab === 'pending';
        const isMeetingExpired = m.isMeetingExpired;
        const isOnline = m.type === 'online';

        let statusColor = "bg-gray-100 text-gray-800 border-gray-200";
        let statusText = m.status;

        if (m.candidato_compareceu) {
            statusColor = "bg-blue-50 text-blue-700 border-blue-200";
            statusText = t("candidate_interview_status_completed", { defaultValue: "Concluída" });
        } else if (m.isMeetingExpired && m.status === 'CONFIRMADA') {
            statusColor = "bg-red-50 text-red-700 border-red-200";
            statusText = t("candidate_interview_status_expired", { defaultValue: "Expirada" });
        } else if (m.status === 'CONFIRMADA') {
            statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
            statusText = t("candidate_interview_status_confirmed", { defaultValue: "Confirmada" });
        } else if (m.status === 'CONCLUIDA') {
            statusColor = "bg-blue-50 text-blue-700 border-blue-200";
            statusText = t("candidate_interview_status_completed", { defaultValue: "Concluída" });
        } else if (m.status === 'PENDENTE_CANDIDATO') {
            statusColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
            statusText = t("candidate_interview_status_pending", { defaultValue: "Aguardando" });
        } else if (m.status === 'RECUSADA') {
            statusColor = "bg-red-50 text-red-700 border-red-200";
            statusText = t("candidate_interview_status_declined", { defaultValue: "Recusada" });
        } else if (m.status === 'CANCELADA') {
            statusColor = "bg-red-50 text-red-700 border-red-200";
            statusText = t("candidate_interview_status_cancelled", { defaultValue: "Cancelada" });
        } else if (m.status === 'EXPIRADA') {
            statusColor = "bg-orange-50 text-orange-700 border-orange-200";
            statusText = t("candidate_interview_status_expired", { defaultValue: "Expirada" });
        }

        const themeColor = isOnline ? 'blue' : 'indigo';
        const isFaded = m.vagaExcluida;

        return (
            <div key={m.id} className={`group bg-white rounded-xl shadow-sm border border-gray-100 transition-all flex flex-col h-full relative min-w-0 overflow-hidden ${isFaded ? 'opacity-60 grayscale-[0.3]' : `hover:shadow-md hover:border-${themeColor}-400`}`}>

                <div className="p-4 sm:p-5 flex-grow flex flex-col relative z-0">
                    <div className="flex items-center mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            {m.empresa?.foto_perfil ? (
                                <Image
                                    src={m.empresa.foto_perfil}
                                    width={40}
                                    height={40}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-gray-100"
                                    alt={t("interview_card_company_label", { defaultValue: "Empresa" })}
                                />
                            ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-100 flex items-center justify-center bg-gray-50">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                                </div>
                            )}
                            <span className="text-xs sm:text-sm font-medium text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">
                                {m.empresa ? m.empresa.nome_empresa : t("company_default", { defaultValue: "Empresa" })}
                            </span>
                            {m.vagaExcluida && (
                                <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
                                    {t("interview_card_vacancy_deleted", { defaultValue: "Vaga Excluída" })}
                                </span>
                            )}
                        </div>
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base transition-colors line-clamp-2 mb-2 text-slate-900 group-hover:text-${themeColor}-600`}>
                        {m.cargo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${statusColor}`}>
                            {m.status === 'CONFIRMADA' && !m.candidato_compareceu && <CheckCircle size={10} />}
                            {(m.status === 'CONCLUIDA' || m.candidato_compareceu) && <CheckCircle size={10} />}
                            {m.status === 'PENDENTE_CANDIDATO' && <AlertTriangle size={10} />}
                            {(m.status === 'CANCELADA' || m.status === 'RECUSADA' || (m.status === 'EXPIRADA' && !m.candidato_compareceu)) && <XCircle size={10} />}
                            {statusText}
                        </span>

                        <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-${themeColor}-50 text-${themeColor}-600`}>
                            {isOnline ? <Video size={12} /> : <MapPin size={12} />}
                            {isOnline ? 'Online' : 'Presencial'}
                        </span>

                        <div className="flex items-center text-[11px] sm:text-xs text-gray-500 gap-1 min-w-0">
                            <Calendar className="text-slate-400 flex-shrink-0 w-3.5 h-3.5" />
                            <span className="truncate whitespace-nowrap">
                                {format(new Date(`${m.data}T00:00:00`), 'dd/MM/yyyy')} às {m.hora_inicio}
                                {m.hora_fim ? ` - ${m.hora_fim}` : ''}
                            </span>
                        </div>
                    </div>

                    {isOnline && isPending && m.criado_em && (
                        <div className="mb-4">
                            <CountdownChip criado_em={m.criado_em} />
                        </div>
                    )}

                    <div className="mt-auto pt-2 flex flex-col gap-2">
                        {(isScheduled || isPending) && (
                            <Link href={isOnline ? `/candidate/interviews/${m.id}/confirm` : (m.status === 'CONFIRMADA' ? `/candidate/interviews/onsite/${m.id}/details` : `/candidate/interviews/onsite/${m.id}/confirm`)} className={`inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 transition shadow-sm hover:shadow active:scale-95`}>
                                {t("interview_card_details_btn", { defaultValue: "Ver Detalhes" })}
                                <ChevronRight size={14} />
                            </Link>
                        )}
                    </div>
                </div>

                {((isScheduled || isMeetingExpired || activeTab === 'history') && m.link_reuniao) && (
                    <div className="px-4 py-2.5 sm:py-3 border-t border-gray-100 bg-gray-50/80 flex flex-wrap justify-between items-center gap-2 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-auto">
                        <span>{t("interview_or_access_link", { defaultValue: "Ou acesse pelo link:" })}</span>
                        {!isMeetingExpired ? (
                            <button
                                onClick={() => {
                                    let url = m.link_reuniao.replace(/"/g, "");
                                    if (!url.startsWith('http')) url = `http://${url}`;
                                    window.open(url, "_blank", "noopener,noreferrer");
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 font-semibold shadow-sm cursor-pointer whitespace-nowrap"
                            >
                                <Video size={12} />
                                {t("interview_meeting_link", { defaultValue: "Entrar na Reunião" })}
                            </button>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-100 font-semibold shadow-sm whitespace-nowrap">
                                Link expirado
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("interviews_page_title", { defaultValue: "Minhas Entrevistas" })}</h1>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed mb-6">{t("interviews_page_subtitle", { defaultValue: "Acompanhe suas entrevistas agendadas e acesse o histórico das sessões concluídas." })}</p>
            </div>

            {pending.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <div className="bg-amber-100 p-2 rounded-full flex-shrink-0 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-900 text-sm">
                            {t("interviews_pending_alert_title", { defaultValue: "Atenção: Você tem convites pendentes!" })}
                        </h3>
                        <p className="text-amber-700 text-xs mt-1">
                            Você possui {pending.length} convite(s) de entrevista aguardando sua resposta na aba "Pendentes". Responda o quanto antes para não perder a oportunidade.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'scheduled' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Calendar size={16} />
                        {t("interviews_tab_scheduled", { defaultValue: "Agendadas" })}
                        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs ${activeTab === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {scheduled.length}
                        </span>
                    </div>
                    {activeTab === 'scheduled' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Timer size={16} className={pending.length > 0 ? "text-red-500 animate-pulse" : ""} />
                        <span className={pending.length > 0 ? "text-red-600" : ""}>{t("interviews_tab_pending", { defaultValue: "Pendentes" })}</span>
                        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs font-bold transition-all ${pending.length > 0 ? 'bg-red-500 text-white shadow-sm ring-2 ring-red-200 animate-pulse' : (activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')}`}>
                            {pending.length}
                        </span>
                    </div>
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        <History size={16} />
                        {t("interviews_tab_history", { defaultValue: "Histórico" })}
                        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs ${activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {history.length}
                        </span>
                    </div>
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                </button>
                {mentorshipReviews.length > 0 && (
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'reviews' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Star size={16} className={activeTab === 'reviews' ? 'fill-blue-500 text-blue-600' : ''} />
                            {t("interviews_tab_reviews", { defaultValue: "Avaliações" })}
                            <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs ${activeTab === 'reviews' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {mentorshipReviews.length}
                            </span>
                        </div>
                        {activeTab === 'reviews' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                )}
            </div>

            <div className="flex items-center">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:max-w-[250px] p-2 outline-none font-medium cursor-pointer"
                >
                    <option value="all">{t("filter_all", "Todos")}</option>
                    <option value="empresas">{t("filter_empresas", "Empresas")}</option>
                    <option value="mentores">{t("filter_mentores", "Mentores")}</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full overflow-hidden">
                {activeTab === 'scheduled' && (
                    scheduled.length > 0 ? scheduled.map(renderCard) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900">{t("interview_empty_scheduled_title", { defaultValue: "Nenhuma entrevista agendada" })}</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("interview_empty_scheduled_desc", { defaultValue: "Você não possui entrevistas confirmadas para os próximos dias." })}</p>
                        </div>
                    )
                )}

                {activeTab === 'pending' && (
                    <>
                        {pending.length > 0 ? pending.map(renderCard) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                                <AlertTriangle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                <h3 className="text-lg font-semibold text-slate-900">{t("interview_empty_pending_title", { defaultValue: "Nenhum convite pendente" })}</h3>
                                <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("interview_empty_pending_desc", { defaultValue: "Você não possui convites de entrevista aguardando sua resposta." })}</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'history' && (
                    history.length > 0 ? history.map(renderCard) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900">{t("interview_empty_history_title", { defaultValue: "Seu histórico está vazio" })}</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("interview_empty_history_desc", { defaultValue: "Você ainda não possui entrevistas concluídas ou canceladas em seu histórico." })}</p>
                        </div>
                    )
                )}

                {activeTab === 'reviews' && (
                    mentorshipReviews.length > 0 ? mentorshipReviews.map((r: any) => {
                        const isFaded = r.vagaExcluida;
                        return (
                            <div key={r.id} className={`group bg-white rounded-2xl border border-slate-200 transition-all flex flex-col h-full relative overflow-hidden ${isFaded ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-lg hover:border-blue-200'}`}>

                                <div className="p-5 flex-grow flex flex-col relative z-0">

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {r.empresa?.foto_perfil ? (
                                            <img src={r.empresa.foto_perfil} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" alt={r.empresa.nome_empresa} />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center bg-blue-50 shadow-sm">
                                                <Building2 className="w-5 h-5 text-blue-400" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                                                    {r.empresa?.nome_empresa || "Empresa"}
                                                </span>
                                                {r.vagaExcluida && (
                                                    <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap mt-0.5">
                                                        {t("interview_card_vacancy_deleted", { defaultValue: "Vaga Excluída" })}
                                                    </span>
                                                )}
                                            </div>
                                            {r.mentor && (
                                                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px] mt-0.5">
                                                    {t("review_card_evaluator", { defaultValue: "Avaliador(a):" })} {r.mentor.nome} {r.mentor.sobrenome}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {r.nota_geral !== null && (
                                        <div className="flex flex-col items-end">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[13px] font-extrabold shadow-sm ${getScoreStyle(r.nota_geral).bg}`}>
                                                {getScoreStyle(r.nota_geral).icon}
                                                {r.nota_geral}<span className="opacity-60 text-[10px] font-normal">/100</span>
                                            </span>
                                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-1.5">
                                                {t("review_card_general_score", { defaultValue: "Nota Geral" })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-4">
                                    {r.cargo}
                                </h3>

                                {r.feedback_geral && (
                                    <div className="mb-5 bg-slate-50 border border-slate-100 rounded-xl p-3 relative shadow-sm">
                                        <div className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                            Feedback
                                        </div>
                                        <p className="text-[13px] text-slate-600 line-clamp-2 italic pt-1 leading-relaxed">
                                            "{r.feedback_geral}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 mt-auto">
                                    {r.nota_comportamental !== null && (
                                        <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                                            <Globe size={14} className="text-slate-400" />
                                            <span>{t("review_card_behavioral", { defaultValue: "Comportamental" })}</span>
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-bold ml-auto ${getScoreStyle(r.nota_comportamental).bg}`}>
                                                {getScoreStyle(r.nota_comportamental).icon}
                                                {r.nota_comportamental}<span className="opacity-60 text-[9px] font-normal">/100</span>
                                            </span>
                                        </div>
                                    )}
                                    {r.nota_tecnica !== null && (
                                        <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium mt-1">
                                            <Brain size={14} className="text-slate-400" />
                                            <span>{t("review_card_technical", { defaultValue: "Técnico" })}</span>
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-bold ml-auto ${getScoreStyle(r.nota_tecnica).bg}`}>
                                                {getScoreStyle(r.nota_tecnica).icon}
                                                {r.nota_tecnica}<span className="opacity-60 text-[9px] font-normal">/100</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-white mt-1 rounded-b-2xl">
                                <span className="text-[11px] font-medium text-slate-400">
                                    {r.feedback_enviado_em 
                                        ? `${t("review_card_evaluated_at", { defaultValue: "Avaliado em:" })} ${format(new Date(r.feedback_enviado_em), 'dd/MM/yyyy')}`
                                        : (r.data ? `${t("review_card_completed_at", { defaultValue: "Concluída em:" })} ${format(new Date(`${r.data}T00:00:00`), 'dd/MM/yyyy')}` : '')}
                                </span>

                                <button
                                    onClick={() => setSelectedReview(r)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer group-hover:shadow"
                                >
                                    <Star size={14} className="group-hover:fill-current" />
                                    {t("review_card_view_btn", { defaultValue: "Ver Avaliação" })}
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Star className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900">{t("interview_empty_reviews_title", { defaultValue: "Nenhuma avaliação disponível" })}</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("interview_empty_reviews_desc", { defaultValue: "Suas avaliações de mentoria aparecerão aqui após as sessões concluídas." })}</p>
                        </div>
                    )
                )}
            </div>


            {selectedReview && (
                <MentorReviewModal
                    review={selectedReview}
                    candidateName={candidateName}
                    onClose={() => setSelectedReview(null)}
                />
            )}
        </div>
    );
}