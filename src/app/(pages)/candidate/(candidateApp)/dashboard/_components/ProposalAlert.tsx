"use client";

import Link from "next/link";
import { Handshake, CheckCircle2, XCircle, Clock, ArrowRight, Building2 } from "lucide-react";

interface Proposta {
    id: string;
    vaga_uuid: string;
    cargo: string;
    empresa_nome: string;
    empresa_foto?: string | null;
    status: string;
    salario?: number | null;
    moeda?: string | null;
    data_inicio?: string | null;
    criado_em: string;
}

interface ProposalAlertProps {
    propostas: Proposta[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    PENDENTE_CANDIDATO: {
        label: "Aguardando sua resposta",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: Clock,
    },
    ACEITA: {
        label: "Proposta aceita",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle2,
    },
    RECUSADA: {
        label: "Proposta recusada",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: XCircle,
    },
};

export function ProposalAlert({ propostas }: ProposalAlertProps) {
    if (!propostas || propostas.length === 0) return null;

    const pendentes = propostas.filter(p => p.status === "PENDENTE_CANDIDATO");
    const outras = propostas.filter(p => p.status !== "PENDENTE_CANDIDATO");

    return (
        <div className="w-full mt-6">
            {/* Alerta de pendentes */}
            {pendentes.length > 0 && (
                <div className="mb-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div>
                            <h3 className="font-bold text-indigo-900 text-base">
                                {pendentes.length === 1
                                    ? "Você tem 1 proposta aguardando sua resposta!"
                                    : `Você tem ${pendentes.length} propostas aguardando sua resposta!`}
                            </h3>
                            <p className="text-xs text-indigo-700/80 mt-0.5">
                                Acesse cada vaga para aceitar ou recusar a proposta da empresa.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pendentes.map(proposta => (
                            <Link
                                key={proposta.id}
                                href={`/viewer/vacancy/${proposta.vaga_uuid}`}
                                className="flex items-center justify-between gap-4 bg-white rounded-xl border border-indigo-100 px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {proposta.empresa_foto ? (
                                        <img src={proposta.empresa_foto} alt={proposta.empresa_nome} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                            <Building2 size={18} className="text-indigo-500" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{proposta.cargo}</p>
                                        <p className="text-xs text-slate-500 truncate">{proposta.empresa_nome}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        <Clock size={12} />
                                        Pendente
                                    </span>
                                    <ArrowRight size={16} className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {outras.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        <Handshake size={16} className="text-slate-400" />
                        Histórico de Propostas
                    </h3>
                    <div className="space-y-2">
                        {outras.map(proposta => {
                            const cfg = statusConfig[proposta.status] || statusConfig.RECUSADA;
                            const Icon = cfg.icon;
                            return (
                                <Link
                                    key={proposta.id}
                                    href={`/viewer/vacancy/${proposta.vaga_uuid}`}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3 hover:border-slate-200 hover:bg-slate-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {proposta.empresa_foto ? (
                                            <img src={proposta.empresa_foto} alt={proposta.empresa_nome} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                <Building2 size={16} className="text-slate-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-700 text-sm truncate">{proposta.cargo}</p>
                                            <p className="text-xs text-slate-400 truncate">{proposta.empresa_nome}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                            <Icon size={12} />
                                            {cfg.label}
                                        </span>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
