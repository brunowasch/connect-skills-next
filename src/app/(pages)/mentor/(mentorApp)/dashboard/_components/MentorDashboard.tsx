"use client";

import { useTranslation } from "react-i18next";
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

export function MentorDashboardContent({ mentor }: { mentor: MentorData }) {
    const { t } = useTranslation();

    return (
        <div className="w-full font-outfit">
            <MentorDashboardHeader />

            <MentorHero mentor={mentor} />

            <MentorProfileCompletion mentor={mentor} />

            <MentorKPI
                mentoringsCount={0}
                availabilityCount={mentor.availabilityCount}
                specialties={mentor.specialties}
            />

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-h-[300px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{t("mentor_next_sessions", "Próximas Mentorias")}</h3>
                    <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm">{t("no_upcoming_sessions", "Nenhuma mentoria agendada no momento.")}</p>
                    </div>
                </section>

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
