"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { Calendar, Clock, Building2, User, CheckCircle, XCircle, AlertTriangle, ChevronRight, Timer, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function useCountdown(criado_em: string) {
    const EXPIRATION_MS = 3 * 24 * 60 * 60 * 1000;

    const getRemaining = () => {
        const deadline = new Date(new Date(criado_em).getTime() + EXPIRATION_MS);
        const diff = deadline.getTime() - Date.now();
        if (diff <= 0) return null;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { days, hours, minutes, isUrgent: diff < 12 * 60 * 60 * 1000 };
    };

    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        const interval = setInterval(() => setRemaining(getRemaining()), 60_000);
        return () => clearInterval(interval);
    }, [criado_em]);

    return remaining;
}

function CountdownChip({ criado_em }: { criado_em: string }) {
    const { t } = useTranslation();
    const remaining = useCountdown(criado_em);

    if (!remaining) {
        return (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold w-fit">
                <AlertTriangle size={13} className="flex-shrink-0" />
                {t("mentorship_countdown_expired")}
            </div>
        );
    }

    const { days, hours, minutes, isUrgent } = remaining;
    const colorClass = isUrgent
        ? "bg-red-50 border-red-200 text-red-700"
        : days === 0
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-blue-50 border-blue-200 text-blue-700";

    const label = days > 0
        ? t("mentorship_countdown_expires_days", { days, hours, minutes })
        : t("mentorship_countdown_expires_hours", { hours, minutes });

    return (
        <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold w-fit ${colorClass}`}>
            <Timer size={13} className={`flex-shrink-0 ${isUrgent ? "animate-pulse" : ""}`} />
            {label}
        </div>
    );
}

function TestExpirationButton() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleTest = async () => {
        setLoading(true);
        try {
            const backdateRes = await fetch("/api/test/backdate-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const backdateData = await backdateRes.json();

            if (!backdateData.success) {
                toast.error("Falha ao retrodar datas.");
                setLoading(false);
                return;
            }

            toast.info(`${backdateData.updated} convite(s) retrodata(s) para 4 dias atrás.`);

            const cronRes = await fetch("/api/cron/interview-expiration");
            const cronData = await cronRes.json();

            if (cronData.success) {
                toast.success(`Cron executado! ${cronData.processed} convite(s) expirado(s). Email e notificação enviados à empresa.`);
                router.refresh();
            } else {
                toast.error("Erro ao executar o cron.");
            }
        } catch {
            toast.error("Falha na requisição.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
        >
            <FlaskConical size={14} />
            {loading ? t("mentorship_test_processing") : `${t("mentorship_test_simulate_btn")}`}
        </button>
    );
}
export default function CandidateMentorshipsClient({ mentorships }: { mentorships: any[] }) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<'scheduled' | 'history' | 'pending'>('scheduled');

    const localeMap: any = { pt: ptBR, en: enUS, es: es };
    const currentLocale = localeMap[i18n.language] || ptBR;

    const scheduled = mentorships.filter(m => m.status === 'CONFIRMADA');
    const pending = mentorships.filter(m => m.status === 'PENDENTE_CANDIDATO');
    const history = mentorships.filter(m => !['CONFIRMADA', 'PENDENTE_CANDIDATO'].includes(m.status));

    const renderCard = (m: any) => {
        const isScheduled = activeTab === 'scheduled';
        const isPending = activeTab === 'pending';

        let statusColor = "bg-gray-100 text-gray-800 border-gray-200";
        let statusText = m.status;

        if (m.status === 'CONFIRMADA') {
            statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
            statusText = t("mentorship_status_confirmed");
        } else if (m.status === 'CONCLUIDA') {
            statusColor = "bg-blue-50 text-blue-700 border-blue-200";
            statusText = t("mentorship_status_completed");
        } else if (m.status === 'PENDENTE_CANDIDATO') {
            statusColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
            statusText = t("mentorship_status_pending");
        } else if (m.status === 'RECUSADA') {
            statusColor = "bg-red-50 text-red-700 border-red-200";
            statusText = t("mentorship_status_declined");
        } else if (m.status === 'CANCELADA') {
            statusColor = "bg-red-50 text-red-700 border-red-200";
            statusText = t("mentorship_status_cancelled");
        } else if (m.status === 'EXPIRADA') {
            statusColor = "bg-orange-50 text-orange-700 border-orange-200";
            statusText = t("mentorship_status_expired");
        }

        return (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                        {m.status === 'CONFIRMADA' && <CheckCircle size={14} />}
                        {m.status === 'CONCLUIDA' && <CheckCircle size={14} />}
                        {m.status === 'PENDENTE_CANDIDATO' && <AlertTriangle size={14} />}
                        {(m.status === 'CANCELADA' || m.status === 'RECUSADA' || m.status === 'EXPIRADA') && <XCircle size={14} />}
                        {statusText}
                    </span>
                </div>

                {/* Company avatar */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[120px]">
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm ring-2 ring-slate-100 flex items-center justify-center overflow-hidden mb-3">
                        {m.empresa?.foto_perfil ? (
                            <Image src={m.empresa.foto_perfil} alt={t("mentorship_card_company_label")} width={56} height={56} className="h-full w-full object-cover" />
                        ) : (
                            <Building2 size={24} className="text-slate-400" />
                        )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 text-center uppercase tracking-wide">{t("mentorship_card_company_label")}</p>
                    <p className="text-xs text-slate-500 font-medium text-center">
                        {m.empresa ? m.empresa.nome_empresa : t("mentorship_card_company_unavailable")}
                    </p>
                </div>

                <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-2 pt-2 md:pt-0">
                        <div className="h-6 w-6 rounded flex items-center justify-center bg-slate-100 overflow-hidden shrink-0">
                            {m.mentor?.foto_perfil ? (
                                <Image src={m.mentor.foto_perfil} alt="Mentor" width={24} height={24} className="h-full w-full object-cover" />
                            ) : (
                                <User size={14} className="text-slate-400" />
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-600 truncate">
                            {m.mentor ? `${m.mentor.nome} ${m.mentor.sobrenome || ''}` : t("mentorship_card_mentor_unavailable")}
                        </h3>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">{m.cargo}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2.5 text-slate-600">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <Calendar size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("mentorship_card_date_label")}</p>
                                <p className="text-sm font-medium">{format(new Date(`${m.data}T00:00:00`), 'dd/MM/yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-600">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("mentorship_card_time_label")}</p>
                                <p className="text-sm font-medium">{m.hora_inicio} - {m.hora_fim}</p>
                            </div>
                        </div>
                    </div>

                    {isPending && m.criado_em && (
                        <CountdownChip criado_em={m.criado_em} />
                    )}

                    {(isScheduled || isPending) && (
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/candidate/dashboard" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-95">
                                {t("mentorship_card_details_btn")}
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t("mentorships_page_title")}</h1>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">{t("mentorships_page_subtitle")}</p>
            </div>

            <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'scheduled' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        {t("mentorships_tab_scheduled")}
                        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs ${activeTab === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {scheduled.length}
                        </span>
                    </div>
                    {activeTab === 'scheduled' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        {t("mentorships_tab_pending")}
                        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs ${activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {pending.length}
                        </span>
                    </div>
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 whitespace-nowrap text-sm font-semibold transition-colors relative ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2 cursor-pointer">
                        {t("mentorships_tab_history")}
                        <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-xs ${activeTab === 'history' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'}`}>
                            {history.length}
                        </span>
                    </div>
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'scheduled' && (
                    scheduled.length > 0 ? scheduled.map(renderCard) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900">{t("mentorship_empty_scheduled_title")}</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("mentorship_empty_scheduled_desc")}</p>
                        </div>
                    )
                )}

                {activeTab === 'pending' && (
                    <>
                        {pending.length > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                <FlaskConical size={16} className="text-purple-600 flex-shrink-0" />
                                <p className="text-xs text-purple-700 font-medium flex-1">
                                    {t("mentorship_test_banner_desc")}
                                </p>
                                <TestExpirationButton />
                            </div>
                        )}

                        {pending.length > 0 ? pending.map(renderCard) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                                <AlertTriangle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                <h3 className="text-lg font-semibold text-slate-900">{t("mentorship_empty_pending_title")}</h3>
                                <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("mentorship_empty_pending_desc")}</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'history' && (
                    history.length > 0 ? history.map(renderCard) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900">{t("mentorship_empty_history_title")}</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">{t("mentorship_empty_history_desc")}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}