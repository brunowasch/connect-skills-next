import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';

interface Application {
    id: string;
    cargo?: string;
    tipo_local_trabalho?: string;
    salario?: number;
    moeda?: string;
    empresa?: {
        id: string;
        nome_empresa?: string;
        foto_perfil?: string;
        cidade?: string;
        estado?: string;
        pais?: string;
    };
    vaga_area?: Array<{
        area_interesse: {
            nome: string;
        };
    }>;
    created_at?: Date;
}

interface ApplicationHistoryProps {
    historicoAplicacoes: Application[];
}

export function ApplicationHistory({ historicoAplicacoes }: ApplicationHistoryProps) {

    {/* Helper para formatar o status (será usado futuramente)
    const formatStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            'pendente': 'Pendente',
            'em_analise': 'Em Análise',
            'selecionado': 'Selecionado',
            'reprovado': 'Finalizado',
        };
        return statusMap[status.toLowerCase()] || status;
    }; */}

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="flex items-center gap-1.5 sm:gap-2 font-bold text-slate-800 text-base sm:text-lg">
                    <Clock className="text-slate-400" size={18} />
                    <span className="hidden xs:inline">Histórico</span>
                    <span className="xs:hidden">Aplicações</span>
                </h2>
                <Link
                    href="/pages/candidate/candidateApp/vacancies"
                    className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                    Ver <span className="hidden sm:inline">completo</span><span className="sm:hidden">tudo</span>
                </Link>
            </div>

            <div className="flex-grow">
                {historicoAplicacoes.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
                        <p className="text-xs sm:text-sm text-slate-500">
                            Você ainda não se candidatou a nenhuma vaga.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {historicoAplicacoes.slice(0, 5).map((item, index) => {
                            const dataAplicacao = item?.created_at ? new Date(item.created_at) : new Date();

                            return (
                                <Link
                                    key={index}
                                    href={`/pages/candidate/candidateApp/vacancies`}
                                    className="group flex justify-between items-start gap-2 sm:gap-3 py-2.5 sm:py-3 first:pt-0 last:pb-0 hover:bg-slate-50/50 transition-colors rounded-lg px-0.5 sm:px-1"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                            {item?.cargo || 'Vaga'}
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                                            {item?.empresa?.nome_empresa || 'Empresa'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">
                                            {dataAplicacao.toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[9px] sm:text-[10px] font-bold text-slate-600 shadow-sm">
                                            Pendente
                                        </span>
                                        <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors sm:w-3.5 sm:h-3.5" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}