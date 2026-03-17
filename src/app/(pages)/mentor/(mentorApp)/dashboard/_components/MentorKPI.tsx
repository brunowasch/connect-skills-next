"use client";

import Link from 'next/link';
import { Calendar, CheckCircle, LayoutGrid, PencilLine } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { AreasList } from "@/src/app/_components/Shared/AreasList";

export interface MentorKPIProps {
    mentoringsCount: number;
    availabilityCount: number;
    specialties: string[];
}

export function MentorKPI({
    mentoringsCount,
    availabilityCount,
    specialties
}: MentorKPIProps) {
    const { t } = useTranslation();

    const hasSpecialties = specialties && specialties.length > 0;

    return (
        <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-blue-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-blue-600">
                    <CheckCircle size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{mentoringsCount}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">{t("mentor_kpi_completed", "Mentorias Realizadas")}</div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className="bg-green-50 p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 text-green-600">
                    <Calendar size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{availabilityCount}</div>
                <div className="text-[11px] sm:text-sm text-slate-500 font-medium uppercase tracking-wide">{t("mentor_kpi_availability", "Horários Disponíveis")}</div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-100 flex flex-col
                col-span-2 lg:col-span-1">

                <div className="flex justify-between items-center mb-3 sm:mb-4 w-full">
                    <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-slate-700 text-sm sm:text-base">
                        <LayoutGrid size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" />
                        {t("mentor_kpi_specialties", "Especialidades")}
                    </div>
                    <Link href="/mentor/specialties" className="text-slate-400 hover:text-blue-600 transition-colors" title={t("edit_specialties", "Editar Especialidades")}>
                        <PencilLine size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </Link>
                </div>


                <div className="flex-grow flex flex-col justify-center items-center">
                    {!hasSpecialties ? (
                        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl text-center w-full border border-dashed border-slate-200">
                            <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">{t("mentor_kpi_no_specialties", "Nenhuma especialidade definida")}</p>
                            <Link
                                href="/mentor/specialties"
                                className="inline-block bg-blue-600 text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                {t("mentor_kpi_setup", "Configurar Agora")}
                            </Link>
                        </div>
                    ) : (
                        <div className="w-full">
                            <AreasList areas={specialties} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
