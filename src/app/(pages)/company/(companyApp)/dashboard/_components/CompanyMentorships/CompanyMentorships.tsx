"use client";

import { Calendar, Clock, ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface CompanyMentorship {
    id: string;
    cargo: string;
    vagaUuid: string;
    candidato: string;
    candidatoFoto?: string | null;
    mentor: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
}

interface CompanyMentorshipsProps {
    mentorships: CompanyMentorship[];
}

export function CompanyMentorships({ mentorships }: CompanyMentorshipsProps) {
    const { t } = useTranslation();

    if (!mentorships || mentorships.length === 0) return null;

    return (
        <div className="w-full mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-emerald-600" />
                {t('dashboard_scheduled_mentorships_title', 'Mentorias Confirmadas (Próximas)')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentorships.map((ment) => (
                    <div key={ment.id} className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                {ment.candidatoFoto ? (
                                    <img 
                                        src={ment.candidatoFoto} 
                                        alt={ment.candidato} 
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {ment.candidato.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{ment.candidato}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{ment.cargo}</p>
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600">
                                <CheckCircle size={16} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                {t('company_mentorship_technical_interview', 'Entrevista técnica com o mentor')} <strong>{ment.mentor}</strong>.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded w-fit bg-emerald-50 text-emerald-600">
                                <Clock size={12} />
                                <span>
                                    {ment.data.split('-').reverse().join('/')} - {ment.hora_inicio}
                                </span>
                            </div>
                        </div>

                        <Link 
                            href={`/company/vacancies/${ment.vagaUuid}/ranking`}
                            className="w-full flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                        >
                            <ExternalLink size={16} />
                            {t('dashboard_view_vacancy_btn', 'Ver Vaga')}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
