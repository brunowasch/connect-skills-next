import React from 'react';
import { Briefcase, Users, FileText } from 'lucide-react';
import { CompanyKPIProps } from '@/src/app/(pages)/company/(companyApp)/types/KPI';

export function CompanyKPI({
    PublishedVacancies,
    ReceivedCandidates,
    OpenVacancies
}: CompanyKPIProps) {
    return (
        <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

            {/* KPI: Vagas Publicadas */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-blue-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-blue-600">
                    <Briefcase size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{PublishedVacancies}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Vagas publicadas</div>
            </div>

            {/* KPI: Candidatos Recebidos */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-indigo-600">
                    <Users size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{ReceivedCandidates}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Candidatos recebidos</div>
            </div>

            {/* KPI: Vagas Abertas - col-span-2 garante que no mobile ele ocupe a largura total se os outros dois estiverem em cima */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full col-span-2 lg:col-span-1">
                <div className="bg-emerald-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-emerald-600">
                    <FileText size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{OpenVacancies}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Vagas abertas</div>
            </div>
        </div>
    );
}
