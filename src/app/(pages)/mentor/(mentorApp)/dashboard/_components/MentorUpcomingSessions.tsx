"use client";

import { Calendar, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UpcomingInterview } from "./MentorDashboard";

interface MentorUpcomingSessionsProps {
    upcomingInterviews: UpcomingInterview[];
}

export function MentorUpcomingSessions({ upcomingInterviews }: MentorUpcomingSessionsProps) {
    const { t } = useTranslation();

    if (!upcomingInterviews || upcomingInterviews.length === 0) return null;

    return (
        <div className="w-full mb-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-emerald-600" />
                {t('mentor_dashboard_scheduled_mentorships', 'Mentorias Confirmadas (Próximas)')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingInterviews.map((ment) => (
                    <div key={ment.id} className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                    {ment.candidato.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{ment.candidato}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{ment.cargo}</p>
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600 shrink-0">
                                <CheckCircle size={16} />
                            </div>
                        </div>

                        <div className="mb-4 mt-4">
                            <p className="text-sm text-gray-600 mb-3">
                                {t('mentor_technical_interview_with', 'Entrevista técnica para a empresa')} <strong>{ment.empresa}</strong>.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded w-fit bg-emerald-50 text-emerald-600">
                                <Clock size={12} />
                                <span>
                                    {ment.data.split('-').reverse().join('/')} - {ment.hora_inicio} às {ment.hora_fim}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
