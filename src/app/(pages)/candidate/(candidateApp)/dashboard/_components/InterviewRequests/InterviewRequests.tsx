"use client";

import { useState } from "react";
import { Calendar, Clock, ArrowRight, CheckCircle, ExternalLink, Building2, ChevronDown, ChevronUp, AlertTriangle, MapPin, Video } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export interface InterviewRequest {
    id: string; 
    status: string;
    cargo: string;
    empresa: {
        nome_empresa: string;
        foto_perfil?: string | null;
    };
    data: string;
    hora_inicio: string;
    criado_em?: string;
    type: 'online' | 'presencial';
}

interface InterviewRequestsProps {
    requests: InterviewRequest[];
}

export function InterviewRequests({ requests }: InterviewRequestsProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(true);

    if (!requests || requests.length === 0) return null;

    return (
        <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    {t('dashboard_interviews_title', 'Entrevistas')}
                </h2>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                >
                    {isOpen ? <ChevronUp size={24} strokeWidth={1.5} /> : <ChevronDown size={24} strokeWidth={1.5} />}
                </button>
            </div>
            
            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => {
                    const isConfirmed = req.status === "CONFIRMADA";
                    const isPendente = req.status === "PENDENTE_CANDIDATO";
                    const isOnline = req.type === 'online';

                    let daysLeft = 0;
                    let hoursLeft = 0;
                    let isExpired = false;

                    if (isOnline && isPendente && req.criado_em) {
                        const createdDate = new Date(req.criado_em);
                        const deadline = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000); 
                        const now = new Date();
                        
                        if (now > deadline) {
                            isExpired = true;
                        } else {
                            const diffMs = deadline.getTime() - now.getTime();
                            daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        }
                    }

                    const themeColor = isOnline ? 'blue' : 'indigo';
                    const themeBorder = isConfirmed ? 'border-emerald-200' : `border-${themeColor}-200`;
                    const themeBg = isConfirmed ? 'bg-emerald-500' : `bg-${themeColor}-500`;
                    const themeText = isConfirmed ? 'text-emerald-600' : `text-${themeColor}-600`;
                    const themeLightBg = isConfirmed ? 'bg-emerald-50' : `bg-${themeColor}-50`;
                    const themeBtnBg = isConfirmed ? 'bg-emerald-600 hover:bg-emerald-700' : `bg-${themeColor}-600 hover:bg-${themeColor}-700`;

                    return (
                        <div key={req.id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${themeBorder}`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${themeBg}`} />
                            
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center bg-gray-50">
                                        {req.empresa?.foto_perfil ? (
                                            <img 
                                                src={req.empresa.foto_perfil} 
                                                alt={req.empresa.nome_empresa || "Empresa"} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
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
                                <div className="flex gap-2 mb-2">
                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${themeLightBg} ${themeText}`}>
                                        {isOnline ? <Video size={10} /> : <MapPin size={10} />}
                                        {isOnline ? 'Online' : 'Presencial'}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                    {isConfirmed 
                                        ? (isOnline ? t('dashboard_mentorship_confirmed_desc', 'Sua entrevista está confirmada. Compareça na data e horário marcados.') : t('dashboard_onsite_confirmed_desc', 'Sua entrevista está confirmada. Compareça no local e horário marcados.'))
                                        : (isOnline ? t('dashboard_mentorship_request_desc', 'A empresa solicitou uma mentoria para você com um de nossos profissionais.') : t('dashboard_onsite_request_desc', 'A empresa convocou você para uma entrevista presencial.'))}
                                </p>
                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded w-fit ${themeLightBg} ${themeText}`}>
                                    <Clock size={12} />
                                    <span>
                                        {req.data.split('-').reverse().join('/')} às {req.hora_inicio}
                                    </span>
                                </div>
                                {isOnline && isPendente && !isExpired && (
                                    <div className="mt-3 bg-amber-50 p-2 rounded-lg flex items-center gap-2 text-amber-700 text-xs font-medium border border-amber-100">
                                        <Clock size={14} className="animate-pulse flex-shrink-0" />
                                        <span>
                                            Expira em: {daysLeft}d {hoursLeft}h
                                        </span>
                                    </div>
                                )}
                                {isOnline && isPendente && isExpired && (
                                    <div className="mt-3 bg-red-50 p-2 rounded-lg flex items-center gap-2 text-red-700 text-xs font-medium border border-red-100">
                                        <AlertTriangle size={14} className="flex-shrink-0" />
                                        <span>Convite expirado.</span>
                                    </div>
                                )}
                            </div>

                            {isOnline && isPendente && isExpired ? (
                                <button
                                    disabled
                                    className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed"
                                >
                                    Expirado
                                </button>
                            ) : (
                                <Link 
                                    href={isOnline ? `/candidate/interviews/${req.id}/confirm` : `/candidate/interviews/onsite/${req.id}/confirm`}
                                    className={`w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${themeBtnBg}`}
                                >
                                    {isConfirmed ? <ExternalLink size={16} /> : <Calendar size={16} />}
                                    {isConfirmed ? t('dashboard_view_interview_confirmed', 'Acessar Detalhes') : t('dashboard_view_interview_btn', 'Ver Detalhes')}
                                    <ArrowRight size={16} className="opacity-70" />
                                </Link>
                            )}
                        </div>
                    );
                })}
                </div>
            )}
        </div>
    );
}
