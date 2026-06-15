"use client";

import { Calendar, CheckCircle, Clock, UserCheck } from 'lucide-react';
import { useTranslation } from "react-i18next";

export interface MentorKPIProps {
    completedCount: number;
    upcomingCount: number;
    pendingCount: number;
    availabilityCount: number;
}

export function MentorKPI({
    completedCount,
    upcomingCount,
    pendingCount,
    availabilityCount
}: MentorKPIProps) {
    const { t } = useTranslation();

    return (
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* KPI: Completed */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-blue-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-blue-600">
                    <CheckCircle size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{completedCount}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide">{t("mentor_kpi_completed", "Mentorias Realizadas")}</div>
            </div>

            {/* KPI: Upcoming */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-emerald-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-emerald-600">
                    <Calendar size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{upcomingCount}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide">{t("mentor_kpi_upcoming", "Próximas Mentorias")}</div>
            </div>

            {/* KPI: Pending */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-amber-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-amber-600">
                    <Clock size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{pendingCount}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide">{t("mentor_kpi_pending", "Solicitações Pendentes")}</div>
            </div>

            {/* KPI: Available slots */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-indigo-600">
                    <UserCheck size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{availabilityCount}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide">{t("mentor_kpi_availability", "Horários Disponíveis")}</div>
            </div>
        </div>
    );
}
