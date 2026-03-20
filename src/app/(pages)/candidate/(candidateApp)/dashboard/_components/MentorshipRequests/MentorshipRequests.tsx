"use client";

import { Calendar, Clock, ArrowRight, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface MentorshipRequest {
    id: string; 
    status: string;
    cargo: string;
    empresa: {
        nome_empresa: string;
        foto_perfil?: string | null;
    };
    data: string;
    hora_inicio: string;
}

interface MentorshipRequestsProps {
    requests: MentorshipRequest[];
}

export function MentorshipRequests({ requests }: MentorshipRequestsProps) {
    const { t } = useTranslation();

    if (!requests || requests.length === 0) return null;

    return (
        <div className="w-full mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                {t('dashboard_mentorship_requests_title', 'Mentorias')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => {
                    const isConfirmed = req.status === "CONFIRMADA";

                    return (
                        <div key={req.id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group 
                            ${isConfirmed ? 'border-emerald-200' : 'border-blue-200'}`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${isConfirmed ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    {req.empresa?.foto_perfil ? (
                                        <img 
                                            src={req.empresa.foto_perfil} 
                                            alt={req.empresa.nome_empresa} 
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <Calendar size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{req.cargo}</h3>
                                        <p className="text-xs text-gray-500">{req.empresa?.nome_empresa || t('company_default', 'Empresa')}</p>
                                    </div>
                                </div>
                                {isConfirmed && (
                                    <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600">
                                        <CheckCircle size={16} />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    {isConfirmed 
                                        ? t('dashboard_mentorship_confirmed_desc', 'Sua entrevista está confirmada. Compareça na data e horário marcados.')
                                        : t('dashboard_mentorship_request_desc', 'A empresa solicitou uma mentoria para você com um de nossos profissionais.')}
                                </p>
                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded w-fit 
                                    ${isConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <Clock size={12} />
                                    <span>
                                        {req.data.split('-').reverse().join('/')} - {req.hora_inicio}
                                    </span>
                                </div>
                            </div>

                            <Link 
                                href={`/candidate/interviews/${req.id}/confirm`}
                                className={`w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer 
                                    ${isConfirmed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isConfirmed ? <ExternalLink size={16} /> : <Calendar size={16} />}
                                {isConfirmed ? t('dashboard_view_mentorship_confirmed', 'Acessar Detalhes') : t('dashboard_view_mentorship_btn', 'Ver Detalhes')}
                                <ArrowRight size={16} className="opacity-70" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
