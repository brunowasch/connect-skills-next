"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FiClock, FiCheck, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { AlertCircle, X, Video, History, CalendarClock, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DbSlot {
    id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    agendamento?: {
        empresaNome: string;
        empresaFoto: string | null;
        empresaUuid: string | null;
        link_reuniao?: string | null;
    } | null;
}

type TabKey = "active" | "history";

export function MentorAvailabilityList({
    slots = [],
    expiredSlots = [],
}: {
    slots: DbSlot[];
    expiredSlots: DbSlot[];
}) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteModalSlotId, setDeleteModalSlotId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("active");

    const handleDeleteClick = (id: string) => {
        setDeleteModalSlotId(id);
    };

    const confirmDelete = async () => {
        if (!deleteModalSlotId) return;

        setIsDeleting(deleteModalSlotId);
        try {
            const res = await fetch(`/api/mentor/availability/${deleteModalSlotId}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
                setDeleteModalSlotId(null);
            } else {
                alert(t("error_delete", "Erro ao excluir."));
            }
        } catch {
            alert(t("error_connection", "Erro de conexão."));
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Data Inválida";
        try {
            const [year, month, day] = dateString.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    const displaySlots = activeTab === "active" ? slots : expiredSlots;

    const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
        {
            key: "active",
            label: "Horários Publicados",
            icon: <CalendarClock className="w-4 h-4" />,
            count: slots.length,
        },
        {
            key: "history",
            label: "Histórico de Reuniões",
            icon: <History className="w-4 h-4" />,
            count: expiredSlots.length,
        },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 font-outfit py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        {t("mentor_availability_title", "Disponibilidade de Horários")}
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base">
                        {t("mentor_availability_subtitle", "Sessões configuradas para que novos talentos possam marcar mentorias.")}
                    </p>
                </div>

                {activeTab === "active" && (
                    <Link
                        href="/mentor/availability/edit"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0"
                    >
                        <FiPlus className="w-4 h-4" />
                        {t("publish_availability_btn", "Publicar Horários")}
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0
                            ${activeTab === tab.key
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full
                                ${activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Empty state */}
            {displaySlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        {activeTab === "active" ? <FiClock className="w-8 h-8" /> : <History className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {activeTab === "active"
                            ? t("no_availability_title", "Nenhum horário cadastrado")
                            : "Nenhum histórico encontrado"}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        {activeTab === "active"
                            ? t("no_availability_desc", "Você ainda não configurou os dias e horários em que está disponível para mentorias.")
                            : "Reuniões e horários que já passaram aparecerão aqui."}
                    </p>
                    {activeTab === "active" && (
                        <Link
                            href="/mentor/availability/edit"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all"
                        >
                            <FiPlus className="w-4 h-4" />
                            {t("publish_availability_btn", "Publicar Horários")}
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {displaySlots.map((slot) => {
                        const formattedDate = formatDate(slot.data);
                        const isExpired = activeTab === "history";

                        return (
                            <div
                                key={slot.id}
                                className={`group bg-white rounded-2xl shadow-sm border transition-all relative
                                    ${isExpired
                                        ? "border-gray-200 opacity-75"
                                        : "border-gray-200 hover:shadow-md hover:border-green-400"
                                    }`}
                            >
                                {/* Expired overlay badge */}
                                {isExpired && (
                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-bold">
                                        <Clock className="w-3 h-3" />
                                        Link Expirado
                                    </div>
                                )}

                                <div className="p-6 md:p-7 pb-5 md:pb-6">
                                    <div className="mb-0">
                                        <div className={`flex items-start gap-3 mb-2 ${isExpired ? "mt-6" : ""}`}>
                                            <h3 className={`font-bold text-lg flex-1 capitalize transition-colors
                                                ${isExpired ? "text-slate-500" : "text-slate-900 group-hover:text-green-600"}`}>
                                                {formattedDate}
                                            </h3>
                                            {slot.agendamento ? (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0
                                                    ${isExpired ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-800"}`}>
                                                    {isExpired ? "Realizada" : t("scheduled", "Agendado")}
                                                </span>
                                            ) : (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0
                                                    ${isExpired ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-800"}`}>
                                                    {isExpired ? "Não agendada" : t("active", "Ativa")}
                                                </span>
                                            )}
                                            {!slot.agendamento && !isExpired && (
                                                <>
                                                    <Link
                                                        href={`/mentor/availability/edit/${slot.id}`}
                                                        className="ml-auto p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                                        title={t("edit_slot", "Editar horário")}
                                                    >
                                                        <FiEdit2 className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClick(slot.id)}
                                                        disabled={isDeleting === slot.id}
                                                        className={`ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ${isDeleting === slot.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        title={t("delete_slot", "Remover horário")}
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
                                        <div className="flex items-center gap-2">
                                            <FiClock className={`w-4 h-4 ${isExpired ? "text-gray-400" : "text-green-500"}`} />
                                            <span>
                                                <span className={`font-semibold ${isExpired ? "text-slate-500" : "text-slate-900"}`}>{slot.hora_inicio}</span>{" "}
                                                <span className="text-xs text-gray-500">{t("start", "Início")}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            <span>
                                                <span className={`font-semibold ${isExpired ? "text-slate-500" : "text-slate-900"}`}>{slot.hora_fim}</span>{" "}
                                                <span className="text-xs text-gray-500">{t("end", "Término")}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card footer */}
                                {slot.agendamento ? (
                                    <div className={`flex items-center justify-between px-6 md:px-7 py-4 border-t border-gray-100 rounded-b-2xl
                                        ${isExpired ? "bg-gray-50" : "bg-blue-50/50"}`}>
                                        {slot.agendamento.empresaUuid ? (
                                            <Link
                                                href={`/viewer/company/${slot.agendamento.empresaUuid}`}
                                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                                title={t("view_company_profile", "Ver perfil da empresa")}
                                            >
                                                {slot.agendamento.empresaFoto ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={slot.agendamento.empresaFoto}
                                                        alt={slot.agendamento.empresaNome}
                                                        className={`w-8 h-8 rounded-full object-cover border ${isExpired ? "border-gray-200 grayscale" : "border-blue-200"}`}
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                                        ${isExpired ? "bg-gray-200 text-gray-500" : "bg-blue-200 text-blue-700"}`}>
                                                        {slot.agendamento.empresaNome.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-medium">{t("scheduled_by", "Agendado por")}</span>
                                                    <span className={`text-sm font-semibold ${isExpired ? "text-slate-500" : "text-blue-600 hover:text-blue-800 hover:underline"}`}>
                                                        {slot.agendamento.empresaNome}
                                                    </span>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {slot.agendamento.empresaFoto ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={slot.agendamento.empresaFoto}
                                                        alt={slot.agendamento.empresaNome}
                                                        className={`w-8 h-8 rounded-full object-cover border ${isExpired ? "border-gray-200 grayscale" : "border-blue-200"}`}
                                                    />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                                        ${isExpired ? "bg-gray-200 text-gray-500" : "bg-blue-200 text-blue-700"}`}>
                                                        {slot.agendamento.empresaNome.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-medium">{t("scheduled_by", "Agendado por")}</span>
                                                    <span className="text-sm font-semibold text-slate-900">{slot.agendamento.empresaNome}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Join button — only for active; expired shows "Link Expirado" */}
                                        {isExpired ? (
                                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 text-sm font-bold select-none">
                                                <Clock className="w-4 h-4" />
                                                Link Expirado
                                            </span>
                                        ) : (
                                            slot.agendamento?.link_reuniao && (
                                                <button
                                                    onClick={() => {
                                                        let url = slot.agendamento?.link_reuniao?.replace(/"/g, "") || "";
                                                        if (url && !url.startsWith("http")) url = `http://${url}`;
                                                        window.open(`${url}${url.includes("?") ? "&" : "?"}host=true`, "_blank", "noopener,noreferrer");
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm text-sm font-bold cursor-pointer"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    {t("join_meeting", "Entrar na Reunião")}
                                                </button>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-6 md:px-7 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                        {isExpired ? (
                                            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> Horário não foi utilizado
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                                                <FiCheck className="w-3.5 h-3.5" /> {t("saved_successfully", "Disponibilidade salva")}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteModalSlotId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setDeleteModalSlotId(null)}
                    />

                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl shrink-0 bg-red-50 text-red-600">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {t("confirm_delete_title", "Remover Horário")}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {t("confirm_delete_desc", "Tem certeza que deseja remover esta disponibilidade? A ação não pode ser desfeita.")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDeleteModalSlotId(null)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                    disabled={isDeleting !== null}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setDeleteModalSlotId(null)}
                                    disabled={isDeleting !== null}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {t("cancel", "Cancelar")}
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting !== null}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30 cursor-pointer disabled:opacity-50"
                                >
                                    {isDeleting ? t("processing", "Processando...") : t("confirm_delete_btn", "Sim, Remover")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
