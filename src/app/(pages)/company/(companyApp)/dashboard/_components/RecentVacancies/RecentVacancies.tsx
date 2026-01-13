import React from 'react';
import Link from 'next/link';
import { Briefcase, ChevronRight, Users, Clock, ArrowUpRight } from 'lucide-react';
import { RecentVacanciesProps } from '@/src/app/(pages)/company/(companyApp)/types/RecentVacancies';

export function RecentVacancies({ vacancies }: RecentVacanciesProps) {
    if (vacancies.length === 0) {
        return (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Briefcase size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhuma vaga recente</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                    Você ainda não publicou nenhuma vaga. Comece a contratar agora mesmo publicando sua primeira oportunidade.
                </p>
                <Link
                    href="/company/vacancies/new"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Publicar Vaga
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Briefcase size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Vagas Recentes</h3>
                </div>
                <Link
                    href="/company/vacancies"
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                >
                    Ver todas <ChevronRight size={16} />
                </Link>
            </div>

            <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar">
                {vacancies.map((vacancy) => (
                    <div
                        key={vacancy.id}
                        className="group p-4 sm:p-5 hover:bg-slate-50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-transparent hover:border-blue-600"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-bold text-slate-800 truncate text-base group-hover:text-blue-600 transition-colors">
                                    {vacancy.title}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${vacancy.status === 'Ativa'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                    {vacancy.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                    <Clock size={14} className="text-slate-400" />
                                    {new Date(vacancy.date).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-400">
                                    <Users size={14} className={vacancy.candidatesCount > 0 ? "text-blue-500" : "text-slate-400"} />
                                    <span className={vacancy.candidatesCount > 0 ? "text-slate-600" : ""}>
                                        {vacancy.candidatesCount} {vacancy.candidatesCount === 1 ? 'candidato' : 'candidatos'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <Link
                            href={`/company/vacancies/${vacancy.id}`}
                            className="bg-white border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md group-hover:scale-105 shrink-0"
                            title="Ver detalhes"
                        >
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Footer gradient hint similar to candidates list if needed, or just padding */}
            {vacancies.length > 0 && (
                <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {vacancies.length} mais recentes
                    </p>
                </div>
            )}
        </div>
    );
}
