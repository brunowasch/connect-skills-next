"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Building2, ChevronDown, ChevronUp, Video, Star, LayoutGrid, PencilLine, CheckCircle2 } from "lucide-react";
import Link from 'next/link';
import { MentorDashboardHeader } from "./MentorDashboardHeader";
import { MentorHero } from "./MentorHero";
import { MentorKPI } from "./MentorKPI";
import { MentorProfileCompletion } from "./MentorProfileCompletion";
import { AreasList } from "@/src/app/_components/Shared/AreasList";

export interface MentorData {
    nome: string | null;
    sobrenome: string | null;
    specialties: string[];
    availabilityCount: number;
    foto_perfil?: string | null;
    bio?: string | null;
    cidade?: string | null;
    estado?: string | null;
    pais?: string | null;
}

export interface UpcomingInterview {
    id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    cargo: string;
    empresa: string;
    empresaFoto?: string | null;
    candidato: string;
    candidatoFoto?: string | null;
    link_reuniao?: string | null;
}

export interface CompletedInterview {
    id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    cargo: string;
    empresa: string;
    empresaFoto?: string | null;
    candidato: string;
    candidatoFoto?: string | null;
    nota_mentor?: number | null;
}

export function MentorDashboardContent({
    mentor,
    upcomingInterviews = [],
    completedInterviews = [],
    completedCount = 0,
    upcomingCount = 0,
    pendingCount = 0,
    avgRating = null,
    ratingsCount = 0
}: {
    mentor: MentorData;
    upcomingInterviews?: UpcomingInterview[];
    completedInterviews?: CompletedInterview[];
    completedCount?: number;
    upcomingCount?: number;
    pendingCount?: number;
    avgRating?: number | null;
    ratingsCount?: number;
}) {
    const { t } = useTranslation();
    const [isMentorshipsOpen, setIsMentorshipsOpen] = useState(true);

    return (
        <div className="w-full font-outfit">
            <MentorDashboardHeader />

            <MentorHero mentor={mentor} />

            <MentorProfileCompletion mentor={mentor} />

            <MentorKPI
                completedCount={completedCount}
                upcomingCount={upcomingCount}
                pendingCount={pendingCount}
                availabilityCount={mentor.availabilityCount}
            />

            <div className="w-full mb-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        {t('mentor_dashboard_scheduled_mentorships', 'Mentorias Confirmadas (Próximas)')}
                    </h2>
                    <button
                        onClick={() => setIsMentorshipsOpen(!isMentorshipsOpen)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                    >
                        {isMentorshipsOpen ? <ChevronUp size={24} strokeWidth={1.5} /> : <ChevronDown size={24} strokeWidth={1.5} />}
                    </button>
                </div>
                {isMentorshipsOpen && (
                    upcomingInterviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingInterviews.map((ment) => (
                                <div key={ment.id} className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

                                    <div className="flex flex-col gap-4 mb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50">
                                                    {ment.empresaFoto ? (
                                                        <img
                                                            src={ment.empresaFoto}
                                                            alt={ment.empresa}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">{t('company_default', 'Empresa')}</p>
                                                    <h3 className="font-semibold text-gray-900 line-clamp-1 leading-tight">{ment.empresa}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{ment.cargo}</p>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600 shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md w-fit bg-emerald-50 text-emerald-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span>
                                                {ment.data.split('-').reverse().join('/')} · {ment.hora_inicio} – {ment.hora_fim}
                                            </span>
                                        </div>
                                    </div>

                                    {ment.candidato && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50">
                                                {ment.candidatoFoto ? (
                                                    <img
                                                        src={ment.candidatoFoto}
                                                        alt={ment.candidato}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium">
                                                <span className="text-[10px] text-slate-400 font-normal block">{t('dashboard_candidate_label', 'Candidato')}</span>
                                                {ment.candidato}
                                            </p>
                                        </div>
                                    )}

                                    {ment.link_reuniao && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-emerald-100 flex items-center justify-between">
                                            {(() => {
                                                let isMeetingExpired = false;
                                                if (ment.data && ment.hora_fim) {
                                                    const [year, month, day] = ment.data.split("-");
                                                    const [hFim, mFim] = ment.hora_fim.split(":");
                                                    if (year && month && day && hFim && mFim) {
                                                        const endData = new Date(Number(year), Number(month) - 1, Number(day), Number(hFim), Number(mFim), 0);
                                                        if (Date.now() > endData.getTime()) {
                                                            isMeetingExpired = true;
                                                        }
                                                    }
                                                }
                                                return !isMeetingExpired ? (
                                                    <button
                                                        onClick={() => {
                                                            let url = ment.link_reuniao?.replace(/"/g, "") || "";
                                                            if (url && !url.startsWith('http')) url = `http://${url}`;
                                                            window.open(`${url}${url.includes('?') ? '&' : '?'}host=true`, "_blank", "noopener,noreferrer");
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                                                    >
                                                        <Video className="w-3.5 h-3.5" />
                                                        {t('join_meeting', 'Entrar na Reunião')}
                                                    </button>
                                                ) : (
                                                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold shadow-sm">
                                                        Link expirado
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-xl p-8 text-center shadow-sm">
                            <p className="text-sm text-slate-500">{t('mentor_dashboard_no_upcoming', 'Nenhuma mentoria confirmada no momento.')}</p>
                        </div>
                    )
                )}
            </div>

            {/* Bottom Redesigned Section */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
                {/* Left Column: Satisfaction & Specialties */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    {/* Specialties Card */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-4 w-full">
                            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                                <LayoutGrid size={18} className="text-slate-400" />
                                {t("mentor_kpi_specialties", "Especialidades")}
                            </div>
                            <Link href="/mentor/specialties" className="text-slate-400 hover:text-blue-600 transition-colors" title={t("edit_specialties", "Editar Especialidades")}>
                                <PencilLine size={18} />
                            </Link>
                        </div>
                        <div className="flex-grow flex flex-col justify-center">
                            {mentor.specialties.length === 0 ? (
                                <div className="bg-slate-50 p-4 rounded-xl text-center w-full border border-dashed border-slate-200">
                                    <p className="text-xs sm:text-sm text-slate-500 mb-3">{t("mentor_kpi_no_specialties", "Nenhuma especialidade definida")}</p>
                                    <Link
                                        href="/mentor/specialties"
                                        className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        {t("mentor_kpi_setup", "Configurar Agora")}
                                    </Link>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <AreasList areas={mentor.specialties} />
                                </div>
                            )}
                        </div>
                    </section>
                    {/* Satisfaction Rating Card */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 w-full text-left">
                            {t("mentor_dashboard_performance_rating", "Avaliação Geral de Satisfação")}
                        </h3>
                        {avgRating !== null ? (
                            <div className="flex flex-col items-center py-4">
                                <div className="text-5xl font-extrabold text-slate-800 mb-2 flex items-baseline gap-1">
                                    {avgRating.toFixed(1)}
                                    <span className="text-xl text-slate-400 font-normal">/5.0</span>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 ${star <= Math.round(avgRating) ? "text-amber-500 fill-amber-500" : "text-slate-200"}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">
                                    {ratingsCount === 1
                                        ? t("mentor_dashboard_ratings_count_one", "Baseado em 1 avaliação")
                                        : t("mentor_dashboard_ratings_count", `Baseado em ${ratingsCount} avaliações`, { count: ratingsCount })}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6">
                                <div className="bg-slate-50 p-3 rounded-full mb-3 text-slate-400">
                                    <Star className="w-8 h-8" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    {t("mentor_dashboard_no_ratings", "Sem avaliações ainda")}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: History of Completed Mentorships */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        {t("mentor_dashboard_completed_history", "Histórico de Mentorias Realizadas")}
                    </h3>
                    <div className="flex-grow flex flex-col justify-start">
                        {completedInterviews.length > 0 ? (
                            <div className="space-y-4 w-full">
                                {completedInterviews.map((ment) => (
                                    <div key={ment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50">
                                                {ment.candidatoFoto ? (
                                                    <img
                                                        src={ment.candidatoFoto}
                                                        alt={ment.candidato}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 text-sm leading-tight">{ment.candidato}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ment.cargo} · {ment.empresa}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                                            <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {ment.data.split('-').reverse().join('/')}
                                            </div>
                                            {ment.nota_mentor !== null && (
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3.5 h-3.5 ${star <= ment.nota_mentor! ? "text-amber-500 fill-amber-500" : "text-slate-200"}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center py-10">
                                <div className="bg-slate-50 p-4 rounded-full mb-3 text-slate-400">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    {t("mentor_dashboard_no_completed", "Nenhuma mentoria concluída até o momento.")}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="h-12"></div>
        </div>
    );
}
