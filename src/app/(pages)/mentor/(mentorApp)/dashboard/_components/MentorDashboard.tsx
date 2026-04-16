"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Building2, ChevronDown, ChevronUp, Video } from "lucide-react";
import { MentorDashboardHeader } from "./MentorDashboardHeader";
import { MentorHero } from "./MentorHero";
import { MentorKPI } from "./MentorKPI";
import { MentorProfileCompletion } from "./MentorProfileCompletion";

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

export function MentorDashboardContent({ mentor, upcomingInterviews = [] }: { mentor: MentorData, upcomingInterviews?: UpcomingInterview[] }) {
    const { t } = useTranslation();
    const [isMentorshipsOpen, setIsMentorshipsOpen] = useState(true);

    return (
        <div className="w-full font-outfit">
            <MentorDashboardHeader />

            <MentorHero mentor={mentor} />

            <MentorProfileCompletion mentor={mentor} />

            <MentorKPI
                mentoringsCount={upcomingInterviews.length}
                availabilityCount={mentor.availabilityCount}
                specialties={mentor.specialties}
            />

            {upcomingInterviews.length > 0 && (
                <div className="w-full mb-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                <line x1="16" x2="16" y1="2" y2="6"/>
                                <line x1="8" x2="8" y1="2" y2="6"/>
                                <line x1="3" x2="21" y1="10" y2="10"/>
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
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md w-fit bg-emerald-50 text-emerald-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        <span>
                                            {ment.data.split('-').reverse().join('/')} · {ment.hora_inicio} – {ment.hora_fim}
                                        </span>
                                    </div>
                                </div>

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
                    )}
                </div>
            )}

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[300px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{t("mentor_tips_resources", "Dicas e Recursos")}</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 text-sm mb-1">{t("tip_title_1", "Complete seu perfil")}</h4>
                            <p className="text-blue-700 text-xs leading-relaxed">
                                {t("tip_desc_1", "Mentores com perfis completos e bio detalhada recebem 3x mais solicitações.")}
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 text-sm mb-1">{t("tip_title_2", "Seja pontual")}</h4>
                            <p className="text-emerald-700 text-xs leading-relaxed">
                                {t("tip_desc_2", "A pontualidade é o fator mais bem avaliado pelos candidatos na plataforma.")}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="h-12"></div>
        </div>
    );
}
