"use client";

import { useTransition } from "react";
import { Edit, Users, Eye, MoreHorizontal, Trash2 } from "lucide-react"; // Icons
import Link from "next/link";
import { useRouter } from "next/navigation";
import { selectVacancyForRanking } from "../actions";

export interface CompanyVacancy {
    id: string;
    uuid?: string | null;
    cargo: string;
    tipo_local_trabalho: 'Presencial' | 'Home_Office' | 'H_brido';
    created_at: Date;
    status: string;
    _count?: {
        vaga_avaliacao?: number;
    };
}

const tipoMap = {
    Presencial: 'Presencial',
    Home_Office: 'Home Office',
    H_brido: 'Híbrido',
};

export function CompanyVacancyCard({ vacancy }: { vacancy: CompanyVacancy }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const applicationCount = vacancy._count?.vaga_avaliacao || 0;

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200 relative">
            {/* Card clicável para ver detalhes */}
            <Link
                href={`/viewer/vacancy/${vacancy.uuid}`}
                className="block p-5 pb-4"
            >
                <div className="mb-4">
                    <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-900 transition-colors group-hover:text-blue-600 flex-1">
                            {vacancy.cargo}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${vacancy.status === 'Ativa'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {vacancy.status}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        {tipoMap[vacancy.tipo_local_trabalho]} • Criada em {vacancy.created_at.toLocaleDateString('pt-BR')}
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <span>
                            <span className="font-semibold text-slate-900">{applicationCount}</span> Candidatos
                        </span>
                    </div>
                </div>
            </Link>

            {/* Botões de ação - não parte do link principal */}
            <div className="flex items-center gap-3 px-5 pb-5 pt-3 border-t border-gray-50">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        startTransition(() => selectVacancyForRanking(vacancy.id));
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                >
                    <Users size={16} />
                    Ver Candidatos
                </button>

                <Link
                    href={`/company/vacancies/${vacancy.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    title="Editar Vaga"
                >
                    <Edit size={16} />
                </Link>
                {vacancy.status === 'Ativa' ? (
                    <button
                        className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                        title="Desativar Vaga"
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm("Deseja desativar esta vaga? Ela deixará de receber novas candidaturas.")) {
                                try {
                                    const res = await fetch(`/api/vacancies/${vacancy.id}/status`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ situacao: 'Inativa' })
                                    });
                                    if (res.ok) {
                                        startTransition(() => {
                                            router.refresh();
                                        });
                                    } else {
                                        alert("Erro ao desativar vaga.");
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Erro ao conectar com servidor.");
                                }
                            }
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                ) : (
                    <button
                        disabled
                        className="flex items-center justify-center w-10 h-10 text-gray-300 bg-gray-50 rounded-lg border border-gray-100 cursor-not-allowed"
                        title="Vaga Inativa"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div >
    );
}
