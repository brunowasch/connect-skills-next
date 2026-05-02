"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
    Building2,
    Plus,
    X,
    Calendar,
    Clock,
    ChevronDown,
    ChevronUp,
    AlertCircle,
} from "lucide-react";
import { DatePicker } from "@/src/app/_components/DatePicker";
import { InterviewSlotCard, OnsiteSlot } from "@/src/app/_components/onsite-interview/InterviewSlotCard";
import { toast } from "sonner";

interface OnsiteInterviewScheduleProps {
    collapsible?: boolean;
    initialSlots?: OnsiteSlot[];
}

export function OnsiteInterviewSchedule({
    collapsible = false,
    initialSlots = [],
}: OnsiteInterviewScheduleProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [isExpanded, setIsExpanded] = useState(true);
    const [slots, setSlots] = useState<OnsiteSlot[]>(initialSlots);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const [newDate, setNewDate] = useState("");
    const [newStart, setNewStart] = useState("");
    const [formError, setFormError] = useState("");
    const [isSavingSlot, setIsSavingSlot] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/company/onsite-interview/slots`);
            const data = await res.json();
            if (data.slots) setSlots(data.slots);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAddSlot = async () => {
        setFormError("");

        if (!newDate) { setFormError(t("onsite_error_empty_date", "Preencha a data.")); return; }
        if (!newStart) { setFormError(t("onsite_error_empty_start", "Preencha o horário de início.")); return; }

        setIsSavingSlot(true);
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
                setIsAddingSlot(false);
                await fetchSlots();
                router.refresh();
            } else {
                setFormError(data.error || t("onsite_error_save", "Erro ao salvar horário."));
            }
        } catch {
            setFormError(t("error_connection", "Erro de conexão."));
        } finally {
            setIsSavingSlot(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        setDeletingId(slotId);
        setShowDeleteConfirm(null);
        try {
            const res = await fetch(`/api/company/onsite-interview/slots/${slotId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(t("onsite_slot_removed", "Horário removido."));
                await fetchSlots();
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

    const confirmedCount = slots.filter(s => s.entrevista_presencial?.status === "CONFIRMADA").length;
    const pendingCount = slots.filter(s => s.entrevista_presencial?.status === "PENDENTE_CANDIDATO").length;
    const availableCount = slots.filter(s => !s.entrevista_presencial).length;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm relative">
            {/* Header */}
            <div
                className={`flex items-center justify-between px-4 py-3.5 border-b border-gray-100 rounded-t-2xl ${collapsible ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
                onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                            {t("onsite_schedule_title", "Entrevistas Presenciais")}
                        </p>
                        <p className="text-[10px] text-slate-400">
                            {slots.length} {slots.length === 1 ? t("onsite_slot_singular", "horário") : t("onsite_slot_plural", "horários")}
                            {confirmedCount > 0 && <span className="ml-1 text-emerald-600 font-semibold">· {confirmedCount} {t("onsite_confirmed_label", "confirmado(s)")}</span>}
                        </p>
                    </div>
                </div>
                {collapsible && (
                    <div className="text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="p-3 space-y-2">
                    {/* Stats bar */}
                    {slots.length > 0 && (
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {availableCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                                    {availableCount} {t("onsite_stat_available", "disponível")}
                                </span>
                            )}
                            {pendingCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                    {pendingCount} {t("onsite_stat_pending", "aguardando")}
                                </span>
                            )}
                            {confirmedCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                                    {confirmedCount} {t("onsite_stat_confirmed", "confirmado(s)")}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Slots list */}
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-6 px-3">
                            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400 font-medium">
                                {t("onsite_no_slots", "Nenhum horário cadastrado.")}
                            </p>
                            <p className="text-[10px] text-gray-300 mt-1">
                                {t("onsite_no_slots_hint", "Adicione horários para os candidatos confirmarem.")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {slots.map((slot) => (
                                <InterviewSlotCard
                                    key={slot.id}
                                    slot={slot}
                                    compact
                                    onDelete={(id) => setShowDeleteConfirm(id)}
                                    isDeleting={deletingId === slot.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add slot form */}
                    {isAddingSlot ? (
                        <div
                            className="mt-2 border border-orange-200 bg-orange-50/50 rounded-xl p-3 space-y-3 animate-in slide-in-from-bottom duration-200"
                            style={{ zIndex: isDatePickerOpen ? 101 : undefined }}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-orange-700">
                                    {t("onsite_add_slot_label", "Novo horário")}
                                </p>
                                <button
                                    onClick={() => { setIsAddingSlot(false); setFormError(""); setNewDate(""); setNewStart(""); }}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Date picker */}
                            <div className="relative" style={{ zIndex: isDatePickerOpen ? 200 : undefined }}>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                                    <Calendar className="w-3 h-3" /> {t("date", "Data")}
                                </label>
                                <DatePicker
                                    value={newDate}
                                    onChange={setNewDate}
                                    disablePastDates={true}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                                    <Clock className="w-3 h-3" /> {t("start_time", "Horário")}
                                </label>
                                <input
                                    type="time"
                                    value={newStart}
                                    onChange={(e) => setNewStart(e.target.value)}
                                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-slate-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-50 outline-none transition-all"
                                />
                            </div>

                            {formError && (
                                <div className="flex items-center gap-1.5 text-red-600 text-[11px]">
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    {formError}
                                </div>
                            )}

                            <button
                                onClick={handleAddSlot}
                                disabled={isSavingSlot}
                                className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                {isSavingSlot ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t("saving_btn", "Salvando...")}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5" />
                                        {t("onsite_save_slot_btn", "Salvar Horário")}
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingSlot(true)}
                            className="w-full mt-2 py-2.5 border-2 border-dashed border-orange-200 hover:border-orange-400 text-orange-500 hover:text-orange-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:bg-orange-50 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {t("onsite_add_slot_btn", "Adicionar Horário")}
                        </button>
                    )}
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setShowDeleteConfirm(null)}
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
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
                            >
                                {t("cancel", "Cancelar")}
                            </button>
                            <button
                                onClick={() => handleDeleteSlot(showDeleteConfirm)}
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
