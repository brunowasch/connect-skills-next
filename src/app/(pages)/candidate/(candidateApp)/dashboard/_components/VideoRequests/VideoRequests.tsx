"use client";

import { Video, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface VideoRequest {
    id: string; 
    uuid: string; 
    cargo: string;
    empresa: {
        nome_empresa: string;
        foto_perfil?: string | null;
    };
    deadline?: string;
    action: string;
}

interface VideoRequestsProps {
    requests: VideoRequest[];
}

export function VideoRequests({ requests }: VideoRequestsProps) {
    const { t } = useTranslation();

    if (!requests || requests.length === 0) return null;

    return (
        <div className="w-full mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Video className="text-purple-600" />
                {t('dashboard_video_requests_title', 'Vídeos Solicitados')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                {req.empresa.foto_perfil ? (
                                    <img 
                                        src={req.empresa.foto_perfil} 
                                        alt={req.empresa.nome_empresa} 
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Video size={20} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{req.cargo}</h3>
                                    <p className="text-xs text-gray-500">{req.empresa.nome_empresa}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                {t('dashboard_video_request_desc', 'A empresa solicitou um vídeo de apresentação.')}
                            </p>
                            {req.deadline && (() => {
                                const deadlineDate = new Date(req.deadline);
                                const now = new Date();
                                const diff = deadlineDate.getTime() - now.getTime();
                                const days = Math.ceil(diff / (1000 * 3600 * 24));
                                const isUrgent = days <= 2;

                                return (
                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded w-fit ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                        <Clock size={12} />
                                        <span>
                                            {t('dashboard_video_deadline', 'Prazo:')} {deadlineDate.toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>

                        <Link 
                            href={`/viewer/vacancy/${req.uuid}?action=upload_video`}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                            <Video size={16} />
                            {t('dashboard_send_video_btn', 'Enviar Vídeo Agora')}
                            <ArrowRight size={16} className="opacity-70" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
