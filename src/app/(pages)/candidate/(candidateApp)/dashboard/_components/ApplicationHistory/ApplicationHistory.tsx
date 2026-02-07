"use client";

import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { ApplicationHistoryProps } from '@/src/app/(pages)/candidate/(candidateApp)/types/ApplicationHistory';
import { useTranslation } from "react-i18next";

export function ApplicationHistory({ historicoAplicacoes }: ApplicationHistoryProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="flex items-center gap-1.5 sm:gap-2 font-bold text-slate-800 text-base sm:text-lg">
                    <Clock className="text-slate-400" size={18} />
                    <span className="hidden xs:inline">{t("dashboard_history_title")}</span>
                    <span className="xs:hidden">{t("dashboard_kpi_applied")}</span>
                </h2>
                <Link
                    href="/candidate/vacancies"
                    className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                    {t("view_all")}
                </Link>
            </div>

            <div className="flex-grow">
                {historicoAplicacoes.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
                        <p className="text-xs sm:text-sm text-slate-500">
                            {t("dashboard_history_empty")}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {historicoAplicacoes.slice(0, 5).map((item, index) => {
                            const dataAplicacao = item?.created_at ? new Date(item.created_at) : new Date();
                            
                            // Se o vídeo foi solicitado e temos o UUID, redirecionar para a vaga
                            const linkHref = item.videoStatus === 'requested' && item.uuid 
                                ? `/viewer/vacancy/${item.uuid}?action=upload_video`
                                : `/candidate/vacancies`;

                            return (
                                <Link
                                    key={index}
                                    href={linkHref}
                                    className="group flex justify-between items-start gap-2 sm:gap-3 py-2.5 sm:py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 transition-colors rounded-lg px-0.5 sm:px-1"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                            {item?.cargo || t("vacancy")}
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                                            {item?.empresa?.nome_empresa || t("company")}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">
                                            {dataAplicacao.toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'), {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                                        {item.videoStatus === 'requested' && (
                                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[9px] sm:text-[10px] font-bold text-purple-600 shadow-sm">
                                                📹 Solicitado
                                            </span>
                                        )}
                                        {item.videoStatus === 'submitted' && (
                                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[9px] sm:text-[10px] font-bold text-green-600 shadow-sm">
                                                ✓ Enviado
                                            </span>
                                        )}
                                        {!item.videoStatus && (
                                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[9px] sm:text-[10px] font-bold text-slate-600 shadow-sm">
                                                {t("pending")}
                                            </span>
                                        )}
                                        <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors sm:w-3.5 sm:h-3.5" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}