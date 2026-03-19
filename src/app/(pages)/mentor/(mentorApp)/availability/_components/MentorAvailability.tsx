"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiCheck, FiX } from "react-icons/fi";
import Link from "next/link";
import Cookies from "js-cookie";
import { DatePicker } from "@/src/app/_components/DatePicker";

interface Slot {
    id?: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    isNew?: boolean;
}

export function MentorAvailability({ initialAvailability = [], userId }: { initialAvailability?: Slot[], userId: string }) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [slots, setSlots] = useState<Slot[]>(initialAvailability.length > 0 ? initialAvailability : []);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatDateForError = (dateString: string) => {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return new Intl.DateTimeFormat(i18n.language || 'pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const addSlotWithDate = (date: string) => {
        setSlots([...slots, { data: date, hora_inicio: "", hora_fim: "" }]);
        setIsModalOpen(false);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: keyof Slot, value: string) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setSlots(newSlots);
    };

    const handleSave = async () => {
        if (slots.length === 0) {
            setError(t("mentor_availability_error_min_slots", "Adicione pelo menos um horário de disponibilidade."));
            return;
        }

        for (const slot of slots) {
            if (!slot.data) {
                setError(t("mentor_availability_error_empty_date", "Preencha todas as datas."));
                return;
            }
            if (!slot.hora_inicio || !slot.hora_fim) {
                setError(t("mentor_availability_error_empty_times_day", { date: formatDateForError(slot.data), defaultValue: `Preencha os horários de início e fim no dia ${formatDateForError(slot.data)}.` }));
                return;
            }
            if (slot.hora_inicio >= slot.hora_fim) {
                setError(t("mentor_availability_error_invalid_interval_day", { 
                    start: slot.hora_inicio, 
                    end: slot.hora_fim, 
                    date: formatDateForError(slot.data),
                    defaultValue: `O horário de início (${slot.hora_inicio}) não pode ser maior ou igual ao horário de término (${slot.hora_fim}) no dia ${formatDateForError(slot.data)}.` 
                }));
                return;
            }
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/mentor/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slots, usuario_id: userId }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || t("mentor_availability_error_save", "Erro ao salvar disponibilidade"));
                setIsSubmitting(false);
                return;
            }

            router.push("/mentor/availability");
            router.refresh();
        } catch {
            setError(t("error_connection"));
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`w-full max-w-4xl mx-auto px-4 sm:px-6 font-outfit py-8 relative ${isModalOpen ? 'z-[101]' : 'z-40'}`}>
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl mb-4">
                    <FiClock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    {t("publish_availability_title", "Publicar Horários")}
                </h2>
                <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
                    {t("publish_availability_subtitle", "Adicione novos dias e horários em que você estará disponível para mentorar novos talentos.")}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    <span className="text-sm font-semibold">{error}</span>
                </div>
            )}

            <div className="space-y-4 mb-10">
                {slots.map((slot, index) => (
                    <div
                        key={index}
                        className="flex flex-col md:flex-row items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-all group animate-in slide-in-from-bottom duration-500 relative"
                        style={{ 
                            animationDelay: `${index * 50}ms`,
                            zIndex: slots.length - index 
                        }}
                    >
                        <div className="flex-1 w-full space-y-2 relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FiCalendar className="w-3 h-3" /> {t("date", "Data da Mentoria")}
                            </label>
                            <DatePicker
                                value={slot.data}
                                onChange={(date) => updateSlot(index, "data", date)}
                                disablePastDates={true}
                            />
                        </div>

                        <div className="w-full md:w-36 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FiClock className="w-3 h-3" /> {t("start_time")}
                            </label>
                            <input
                                type="time"
                                value={slot.hora_inicio}
                                onChange={(e) => updateSlot(index, "hora_inicio", e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="w-full md:w-36 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FiClock className="w-3 h-3" /> {t("end_time")}
                            </label>
                            <input
                                type="time"
                                value={slot.hora_fim}
                                onChange={(e) => updateSlot(index, "hora_fim", e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => removeSlot(index)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Remover horário"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </button>
                     </div>
                 ))}

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-600 transition-all group bg-white cursor-pointer"
                >
                    <FiPlus className="w-4 h-4" />
                    {t("add_availability_slot", "Adicionar novo horário")}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pb-12">
                <Link
                    href="/mentor/availability"
                    className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-base"
                >
                    {t("back_btn", "Voltar")}
                </Link>
                <button
                    onClick={handleSave}
                    disabled={isSubmitting || slots.length === 0}
                    className={`px-10 py-3 rounded-xl font-bold text-white text-base transition-all shadow-sm flex items-center gap-2 ${isSubmitting || slots.length === 0
                            ? "bg-slate-200 cursor-not-allowed text-slate-400 shadow-none border-transparent"
                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-blue-100"
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t("saving_btn", "Salvando...")}
                        </div>
                    ) : (
                        <>
                            <span>{t("publish_availability_btn", "Publicar Horários")}</span>
                            <FiCheck className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-[360px] relative animate-in zoom-in-95 duration-200">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">{t("mentor_availability_modal_title", "Nova Mentoria")}</h3>
                            <p className="text-sm text-slate-500 mt-1">{t("mentor_availability_modal_desc", "Escolha o dia no calendário abaixo.")}</p>
                        </div>
                        <DatePicker 
                            inline 
                            value={new Date().toISOString().split('T')[0]} 
                            onChange={addSlotWithDate} 
                            disablePastDates={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
