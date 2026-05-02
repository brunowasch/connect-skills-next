"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
    Building2, Plus, Calendar, History, CalendarClock, Clock,
    User, CheckCircle, AlertCircle, X, Trash2
} from "lucide-react";
import { DatePicker } from "@/src/app/_components/DatePicker";
import { toast } from "sonner";

type SlotStatus = "PENDENTE_CANDIDATO" | "CONFIRMADA" | "CANCELADA" | null;

interface EnrichedSlot {
    id: string;
    data: string;
    hora_inicio: string;
    vagaTitle: string | null;
    candidato: {
        id: string;
        nome: string | null;
        sobrenome: string | null;
        foto_perfil: string | null;
        uuid: string | null;
        usuario: { avatarUrl: string | null } | null;
    } | null;
    entrevista_presencial: {
        id: string;
        status: string;
        candidato_id: string;
        vaga_id: string;
    } | null;
}

type TabKey = "active" | "history";

interface Props {
    activeSlots: EnrichedSlot[];
    historySlots: EnrichedSlot[];
}

export function OnsiteScheduleList({ activeSlots, historySlots }: Props) {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<TabKey>("active");
    const [isAdding, setIsAdding] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [newStart, setNewStart] = useState("");
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const displaySlots = activeTab === "active" ? activeSlots : historySlots;



    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "pt-BR", {
                weekday: "short", day: "2-digit", month: "short", year: "numeric",
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const handleSave = async () => {
        setFormError("");
        if (!newDate) { setFormError(t("onsite_error_empty_date", "Preencha a data.")); return; }
        if (!newStart) { setFormError(t("onsite_error_empty_start", "Preencha o horário de início.")); return; }

        setIsSaving(true);
        try {
            const res = await fetch("/api/company/onsite-interview/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: newDate, hora_inicio: newStart }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(t("onsite_slot_added", "Horário adicionado com sucesso!"));
                setNewDate("");
                setNewStart("");
                setIsAdding(false);
                router.refresh();
            } else {
                setFormError(data.error || t("onsite_error_save", "Erro ao salvar horário."));
            }
        } catch {
            setFormError(t("error_connection", "Erro de conexão."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (slotId: string) => {
        setDeletingId(slotId);
        setDeleteConfirmId(null);
        try {
            const res = await fetch(`/api/company/onsite-interview/slots/${slotId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(t("onsite_slot_removed", "Horário removido."));
                router.refresh();
            } else {
                toast.error(data.error || t("error_delete", "Erro ao excluir."));
            }
        } catch {
            toast.error(t("error_connection", "Erro de conexão."));
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (slot: EnrichedSlot) => {
        const status = slot.entrevista_presencial?.status as SlotStatus;
        if (!status) return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                {t("onsite_slot_available", "Disponível")}
            </span>
        );
        if (status === "PENDENTE_CANDIDATO") return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                {t("onsite_status_pending", "Aguardando candidato")}
            </span>
        );
        if (status === "CONFIRMADA") return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {t("onsite_status_confirmed", "Confirmada")}
            </span>
        );
        return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                {t("onsite_status_cancelled", "Recusada")}
            </span>
        );
    };

    const tabs = [
        { key: "active" as TabKey, label: t("onsite_tab_active", "Horários Publicados"), icon: <CalendarClock className="w-4 h-4" />, count: activeSlots.length },
        { key: "history" as TabKey, label: t("onsite_tab_history", "Histórico"), icon: <History className="w-4 h-4" />, count: historySlots.length },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 font-outfit py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        {t("onsite_schedule_title", "Entrevistas Presenciais")}
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base">
                        {t("onsite_schedule_subtitle", "Publique horários disponíveis para candidatos confirmarem a presença.")}
                    </p>
                </div>
                {activeTab === "active" && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        {t("onsite_add_slot_btn", "Adicionar Horário")}
                    </button>
                )}
            </div>

            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0
                            ${activeTab === tab.key
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full
                                ${activeTab === tab.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {isAdding && activeTab === "active" && (
                <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 animate-in slide-in-from-top duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Plus className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-indigo-900 text-sm">
                                {t("onsite_add_slot_label", "Novo Horário")}
                            </h3>
                        </div>
                        <button
                            onClick={() => { setIsAdding(false); setFormError(""); setNewDate(""); setNewStart(""); }}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                                <Calendar className="w-3.5 h-3.5" /> {t("date", "Data")}
                            </label>
                            <DatePicker value={newDate} onChange={setNewDate} disablePastDates={true} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                                <Clock className="w-3.5 h-3.5" /> {t("start_time", "Horário")}
                            </label>
                            <input
                                type="time"
                                value={newStart}
                                onChange={(e) => setNewStart(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {formError && (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs mt-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {formError}
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => { setIsAdding(false); setFormError(""); setNewDate(""); setNewStart(""); }}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                        >
                            {t("cancel", "Cancelar")}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold transition-colors cursor-pointer disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t("saving_btn", "Salvando...")}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {t("onsite_save_slot_btn", "Salvar Horário")}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {displaySlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm text-center">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        {activeTab === "active" ? <Building2 className="w-8 h-8" /> : <History className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {activeTab === "active"
                            ? t("onsite_no_slots", "Nenhum horário cadastrado.")
                            : t("onsite_no_history", "Nenhum histórico encontrado.")}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                        {activeTab === "active"
                            ? t("onsite_no_slots_hint", "Adicione horários para os candidatos confirmarem.")
                            : t("onsite_no_history_hint", "Horários utilizados ou expirados aparecerão aqui.")}
                    </p>
                    {activeTab === "active" && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            {t("onsite_add_slot_btn", "Adicionar Horário")}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {displaySlots.map((slot) => {
                        const isHistory = activeTab === "history";
                        const candidateName = slot.candidato
                            ? [slot.candidato.nome, slot.candidato.sobrenome].filter(Boolean).join(" ")
                            : null;
                        const candidateAvatar = slot.candidato?.foto_perfil || slot.candidato?.usuario?.avatarUrl;

                        return (
                            <div
                                key={slot.id}
                                className={`group bg-white rounded-2xl shadow-sm border transition-all relative
                                    ${isHistory
                                        ? "border-gray-200 opacity-80"
                                        : slot.entrevista_presencial?.status === "CONFIRMADA"
                                            ? "border-emerald-300 shadow-md"
                                            : slot.entrevista_presencial
                                                ? "border-amber-200 hover:shadow-md"
                                                : "border-gray-200 hover:shadow-md hover:border-indigo-300"
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className={`font-bold text-lg capitalize ${isHistory ? "text-slate-500" : "text-slate-900"}`}>
                                                {formatDate(slot.data)}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{slot.hora_inicio}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(slot)}
                                        </div>
                                    </div>

                                    {candidateName ? (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 flex items-center justify-center">
                                                {candidateAvatar ? (
                                                    <img src={candidateAvatar} alt={candidateName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-indigo-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm truncate">{candidateName}</p>
                                                {slot.vagaTitle && (
                                                    <p className="text-xs text-slate-400 truncate">{slot.vagaTitle}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100 mb-4 text-xs text-green-700 font-medium">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {t("onsite_slot_free", "Disponível para agendamento")}
                                        </div>
                                    )}

                                    {!isHistory && !slot.entrevista_presencial && (
                                        <button
                                            onClick={() => setDeleteConfirmId(slot.id)}
                                            disabled={deletingId === slot.id}
                                            className="w-full py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {deletingId === slot.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                            {t("delete_slot", "Remover horário")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setDeleteConfirmId(null)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{t("confirm_delete_title", "Remover Horário")}</h3>
                                <p className="text-sm text-slate-500 mt-1">{t("confirm_delete_desc", "Tem certeza que deseja remover esta disponibilidade? A ação não pode ser desfeita.")}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
                            >
                                {t("cancel", "Cancelar")}
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm"
                            >
                                {t("confirm_delete_btn", "Sim, Remover")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
