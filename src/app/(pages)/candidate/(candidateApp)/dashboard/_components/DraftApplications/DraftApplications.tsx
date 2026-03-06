"use client";

import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, ArrowRight, Building2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Vacancy } from '@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy';

export interface DraftApplicationsProps {
    draftVacancies: Vacancy[];
}

export function DraftApplications({ draftVacancies }: DraftApplicationsProps) {
    const { t } = useTranslation();

    if (!draftVacancies || draftVacancies.length === 0) return null;

    return (
        <div className="w-full mt-2 lg:mt-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                {t("dashboard_drafts_title", "Candidaturas Incompletas")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftVacancies.map((req) => (
                    <div key={req.id} className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                {req.empresa?.foto_perfil ? (
                                    <img 
                                        src={req.empresa.foto_perfil} 
                                        alt={req.empresa.nome_empresa} 
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Building2 size={20} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{req.cargo}</h3>
                                    <p className="text-xs text-slate-500">{req.empresa?.nome_empresa || t('company')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-slate-600 mb-3">
                                {t('dashboard_draft_desc', 'Avaliação iniciada. Você ainda não enviou suas respostas.')}
                            </p>
                            
                            <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-md w-fit bg-slate-100 text-slate-600 border border-slate-200">
                                <Clock size={14} />
                                <span>
                                    {t("assessment_section_badge", { current: (req.currentSection || 0) + 1, total: 3 })}
                                </span>
                            </div>
                        </div>

                        <Link 
                            href={`/candidate/vacancies/${req.uuid}/apply`}
                            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                        >
                            <PlayCircle size={18} />
                            {t('assessment_resume_btn', 'Continuar Avaliação')}
                            <ArrowRight size={16} className="opacity-70" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
