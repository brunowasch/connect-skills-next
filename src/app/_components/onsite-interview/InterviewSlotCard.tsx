"use client";

import { Calendar, Clock, Trash2, User, CheckCircle2, XCircle, HourglassIcon } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export interface OnsiteSlot {
    id: string;
    data: string;
    hora_inicio: string;
    entrevista_presencial: {
        id: string;
        status: "PENDENTE_CANDIDATO" | "CONFIRMADA" | "CANCELADA";
        candidato_id: string;
    } | null;
    candidato: {
        nome: string | null;
        sobrenome: string | null;
        foto_perfil: string | null;
        uuid: string | null;
        usuario: { avatarUrl: string | null } | null;
    } | null;
}

interface InterviewSlotCardProps {
    slot: OnsiteSlot;
    onDelete?: (slotId: string) => void;
    isDeleting?: boolean;
    compact?: boolean;
}

export function InterviewSlotCard({
    slot,
    onDelete,
    isDeleting,
    compact = false,
}: InterviewSlotCardProps) {
    const { t, i18n } = useTranslation();

    const formatDate = (dateString: string) => {
        try {
            const [year, month, day] = dateString.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "pt-BR", {
                weekday: compact ? undefined : "short",
                day: "2-digit",
                month: "short",
                year: compact ? undefined : "numeric",
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const candidateName = slot.candidato
        ? `${slot.candidato.nome || ""} ${slot.candidato.sobrenome || ""}`.trim()
        : null;

    const candidatePhoto =
        slot.candidato?.foto_perfil ||
        slot.candidato?.usuario?.avatarUrl ||
        null;

    const interview = slot.entrevista_presencial;

    const statusConfig = {
        CONFIRMADA: {
            label: t("onsite_status_confirmed", "Confirmada"),
            color: "bg-emerald-100 text-emerald-700 border-emerald-200",
            icon: <CheckCircle2 className="w-3 h-3" />,
            cardBorder: "border-emerald-300",
        },
        PENDENTE_CANDIDATO: {
            label: t("onsite_status_pending", "Aguardando candidato"),
            color: "bg-amber-100 text-amber-700 border-amber-200",
            icon: <HourglassIcon className="w-3 h-3" />,
            cardBorder: "border-amber-200",
        },
        CANCELADA: {
            label: t("onsite_status_cancelled", "Recusada"),
            color: "bg-red-100 text-red-600 border-red-200",
            icon: <XCircle className="w-3 h-3" />,
            cardBorder: "border-red-200",
        },
    };

    const statusInfo = interview
        ? statusConfig[interview.status as keyof typeof statusConfig]
        : null;

    const canDelete = !interview || interview.status === "CANCELADA";

    return (
        <div
            className={`rounded-xl border bg-white transition-all ${statusInfo?.cardBorder ?? "border-gray-200"
                } ${compact ? "p-3" : "p-4 hover:shadow-sm"}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 ${compact ? "text-xs" : "text-sm"} font-bold text-slate-800 capitalize`}>
                        <Calendar className={compact ? "w-3 h-3 text-slate-400" : "w-4 h-4 text-slate-400"} />
                        {formatDate(slot.data)}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 ${compact ? "text-xs" : "text-sm"} text-slate-500`}>
                        <Clock className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                        {slot.hora_inicio}
                    </div>
                </div>

                {statusInfo && (
                    <span
                        className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                    >
                        {statusInfo.icon}
                        {statusInfo.label}
                    </span>
                )}

                {onDelete && canDelete && (
                    <button
                        onClick={() => onDelete(slot.id)}
                        disabled={isDeleting}
                        className="ml-1 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                        title={t("delete_slot", "Remover horário")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Candidate block */}
            {candidateName && interview ? (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    {slot.candidato?.uuid ? (
                        <Link
                            href={`/viewer/candidate/${slot.candidato.uuid}`}
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-blue-100 flex items-center justify-center">
                                {candidatePhoto ? (
                                    <img src={candidatePhoto} alt={candidateName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-3.5 h-3.5 text-blue-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className={`font-semibold truncate group-hover:text-blue-600 transition-colors ${compact ? "text-xs" : "text-sm"} text-slate-800`}>
                                    {candidateName}
                                </p>
                                <p className="text-[10px] text-slate-400">{t("onsite_candidate_label", "Candidato")}</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-blue-100 flex items-center justify-center">
                                {candidatePhoto ? (
                                    <img src={candidatePhoto} alt={candidateName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-3.5 h-3.5 text-blue-400" />
                                )}
                            </div>
                            <div>
                                <p className={`font-semibold ${compact ? "text-xs" : "text-sm"} text-slate-800`}>{candidateName}</p>
                                <p className="text-[10px] text-slate-400">{t("onsite_candidate_label", "Candidato")}</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : !interview ? (
                <div className="mt-2">
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        {t("onsite_slot_available", "Disponível")}
                    </span>
                </div>
            ) : null}
        </div>
    );
}
