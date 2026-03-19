"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FiClock, FiCalendar, FiCheck } from "react-icons/fi";
import Link from "next/link";

interface DbSlot {
    id: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fim: string;
}

const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export function MentorAvailabilityEditSingle({ slot }: { slot: DbSlot }) {
    const { t } = useTranslation();
    const router = useRouter();
    
    const [diaSemana, setDiaSemana] = useState(days[slot.dia_semana] || "Segunda-feira");
    const [horaInicio, setHoraInicio] = useState(slot.hora_inicio);
    const [horaFim, setHoraFim] = useState(slot.hora_fim);
    
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!horaInicio || !horaFim) {
            setError(t("error_empty_times", "Preencha os horários de início e fim."));
            return;
        }

        if (horaInicio >= horaFim) {
            setError(t("error_invalid_interval", `O horário de início (${horaInicio}) não pode ser maior ou igual ao horário de término (${horaFim}).`));
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/mentor/availability/${slot.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dia_semana: diaSemana,
                    hora_inicio: horaInicio,
                    hora_fim: horaFim
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || t("error_update", "Erro ao atualizar horário."));
                setIsSubmitting(false);
                return;
            }

            router.push("/mentor/availability");
            router.refresh();
        } catch {
            setError(t("error_connection", "Erro de conexão."));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 font-outfit py-8">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-amber-50 text-amber-600 rounded-xl mb-4">
                    <FiClock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    {t("edit_availability_title", "Editar Horário")}
                </h2>
                <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
                    {t("edit_availability_desc", "Atualize o dia e o horário deste bloco em sua agenda de mentorias.")}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    <span className="text-sm font-semibold">{error}</span>
                </div>
            )}

            <div className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 mb-10">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FiCalendar className="w-3.5 h-3.5" /> {t("day_of_week", "Dia da Semana")}
                    </label>
                    <select
                        value={diaSemana}
                        onChange={(e) => setDiaSemana(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all cursor-pointer"
                    >
                        {days.map((d) => (
                            <option key={d} value={d}>{t(d)}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FiClock className="w-3.5 h-3.5" /> {t("start_time", "Hora de Início")}
                        </label>
                        <input
                            type="time"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FiClock className="w-3.5 h-3.5" /> {t("end_time", "Hora de Fim")}
                        </label>
                        <input
                            type="time"
                            value={horaFim}
                            onChange={(e) => setHoraFim(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pb-12">
                <Link
                    href="/mentor/availability"
                    className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-base w-full sm:w-auto text-center"
                >
                    {t("cancel", "Cancelar")}
                </Link>
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className={`px-10 py-3 rounded-xl font-bold text-white text-base transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto ${isSubmitting
                            ? "bg-slate-200 cursor-not-allowed text-slate-400 shadow-none border-transparent"
                            : "bg-amber-500 hover:bg-amber-600 cursor-pointer shadow-amber-100"
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t("saving_btn", "Salvando...")}
                        </div>
                    ) : (
                        <>
                            <span>{t("save_changes", "Salvar Alterações")}</span>
                            <FiCheck className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
