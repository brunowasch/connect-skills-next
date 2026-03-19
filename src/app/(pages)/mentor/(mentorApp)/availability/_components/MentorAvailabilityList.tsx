"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FiClock, FiCheck, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { AlertCircle, X } from "lucide-react";
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
    } | null;
}

export function MentorAvailabilityList({ slots = [] }: { slots: DbSlot[] }) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteModalSlotId, setDeleteModalSlotId] = useState<string | null>(null);

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
            return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 font-outfit py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        {t("mentor_availability_title", "Disponibilidade de Horários")}
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base">
                        {t("mentor_availability_subtitle", "Sessões configuradas para que novos talentos possam marcar mentorias.")}
                    </p>
                </div>

                <Link
                    href="/mentor/availability/edit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0"
                >
                    <FiPlus className="w-4 h-4" />
                    {t("publish_availability_btn", "Publicar Horários")}
                </Link>
            </div>

            {slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <FiClock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t("no_availability_title", "Nenhum horário cadastrado")}</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        {t("no_availability_desc", "Você ainda não configurou os dias e horários em que está disponível para mentorias.")}
                    </p>
                    <Link
                        href="/mentor/availability/edit"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all"
                    >
                        <FiPlus className="w-4 h-4" />
                        {t("publish_availability_btn", "Publicar Horários")}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {slots.map((slot) => {
                        const formattedDate = formatDate(slot.data);
                        return (
                            <div key={slot.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-green-400 relative">
                                <div className="p-6 md:p-7 pb-5 md:pb-6">
                                    <div className="mb-0">
                                        <div className="flex items-start gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-slate-900 transition-colors group-hover:text-green-600 flex-1 capitalize">
                                                {formattedDate}
                                            </h3>
                                            {slot.agendamento ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-blue-100 text-blue-800">
                                                    {t("scheduled", "Agendado")}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-green-100 text-green-800">
                                                    {t("active", "Ativa")}
                                                </span>
                                            )}
                                            {!slot.agendamento && (
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
                                                        className={`ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ${isDeleting === slot.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                            <FiClock className="text-green-500 w-4 h-4" />
                                            <span>
                                                <span className="font-semibold text-slate-900">{slot.hora_inicio}</span> <span className="text-xs text-gray-500">{t("start", "Início")}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            <span>
                                                <span className="font-semibold text-slate-900">{slot.hora_fim}</span> <span className="text-xs text-gray-500">{t("end", "Término")}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {slot.agendamento ? (
                                    <div className="flex items-center justify-between px-6 md:px-7 py-4 border-t border-gray-100 bg-blue-50/50 rounded-b-2xl">
                                        {slot.agendamento.empresaUuid ? (
                                            <Link href={`/viewer/company/${slot.agendamento.empresaUuid}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" title={t("view_company_profile", "Ver perfil da empresa")}>
                                                {slot.agendamento.empresaFoto ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={slot.agendamento.empresaFoto} alt={slot.agendamento.empresaNome} className="w-8 h-8 rounded-full object-cover border border-blue-200" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                        {slot.agendamento.empresaNome.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-medium">{t("scheduled_by", "Agendado por")}</span>
                                                    <span className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">{slot.agendamento.empresaNome}</span>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {slot.agendamento.empresaFoto ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={slot.agendamento.empresaFoto} alt={slot.agendamento.empresaNome} className="w-8 h-8 rounded-full object-cover border border-blue-200" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                        {slot.agendamento.empresaNome.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-medium">{t("scheduled_by", "Agendado por")}</span>
                                                    <span className="text-sm font-semibold text-slate-900">{slot.agendamento.empresaNome}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-6 md:px-7 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                            <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                                                <FiCheck className="w-3.5 h-3.5"/> {t("saved_successfully", "Disponibilidade salva")}
                                            </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

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
                                        {t('confirm_delete_title', 'Remover Horário')}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {t('confirm_delete_desc', 'Tem certeza que deseja remover esta disponibilidade? A ação não pode ser desfeita.')}
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
                                    {t('cancel', 'Cancelar')}
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting !== null}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30 cursor-pointer disabled:opacity-50"
                                >
                                    {isDeleting ? t('processing', 'Processando...') : t('confirm_delete_btn', 'Sim, Remover')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
