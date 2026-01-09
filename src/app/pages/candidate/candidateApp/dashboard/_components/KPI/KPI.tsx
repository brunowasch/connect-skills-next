import Link from 'next/link';
import { Search, Send, LayoutGrid, PencilLine } from 'lucide-react';

interface KPIProps {
    recommendedVacanciesCount: number;
    appliedVacanciesCount: number;
    areas: string[];
}

export function KPI({
    recommendedVacanciesCount,
    appliedVacanciesCount,
    areas
}: KPIProps) {

    const limitAreas = 8;
    const hasAreas = areas && areas.length > 0;

    return (
        <div className="vacancies w-full grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-blue-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-blue-600">
                    <Search size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{recommendedVacanciesCount}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Vagas encontradas</div>
            </div>

            {/* KPI: Vagas Aplicadas */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-green-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-green-600">
                    <Send size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{appliedVacanciesCount}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Vagas aplicadas</div>
            </div>

            {/* Card: Áreas de Interesse */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-100 flex flex-col
                col-span-2 lg:col-span-1">

                <div className="flex justify-between items-center mb-3 sm:mb-4 w-full">
                    <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-slate-700 text-sm sm:text-base">
                        <LayoutGrid size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" />
                        Áreas de interesse
                    </div>
                    <Link href="/pages/candidate/candidateApp/profile" className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar áreas">
                        <PencilLine size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </Link>
                </div>


                <div className="flex-grow flex flex-col justify-center items-center">
                    {!hasAreas ? (
                        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl text-center w-full border border-dashed border-slate-200">
                            <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">Nenhuma área selecionada</p>
                            <Link
                                href="/pages/candidate/candidateApp/profile"
                                className="inline-block bg-blue-600 text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Configurar
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                            {areas.slice(0, limitAreas).map((area, index) => (
                                <span
                                    key={index}
                                    className="bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-tight"
                                >
                                    {area}
                                </span>
                            ))}

                            {areas.length > limitAreas && (
                                <span className="bg-blue-50 text-blue-600 text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                    +{areas.length - limitAreas}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}