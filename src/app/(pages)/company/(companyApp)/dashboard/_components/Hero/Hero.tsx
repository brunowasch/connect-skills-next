"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Plus, User, Building2 } from 'lucide-react';
import { CompanyHeroProps } from '@/src/app/(pages)/company/(companyApp)/types/Hero';
import { useTranslation } from "react-i18next";

const DEFAULT_AVATAR = "/img/avatar-empresa.png";

export function CompanyHero({ companyData }: CompanyHeroProps) {
    const { t } = useTranslation();
    const { nomeEmpresa, fotoPerfil, localidade } = companyData;

    const fotoUrl = fotoPerfil && fotoPerfil.trim() !== '' ? fotoPerfil : DEFAULT_AVATAR;
    const localizacao = localidade || t("location_not_informed");

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-10 mb-4 sm:mb-6 border border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">

                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 flex items-center justify-center border border-slate-300 overflow-hidden">
                        {fotoUrl && fotoUrl !== DEFAULT_AVATAR ? (
                            <Image
                                src={fotoUrl}
                                alt={`Logo da ${nomeEmpresa}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 m-0 truncate">
                            {t("dashboard_hero_welcome_company", { name: nomeEmpresa })}
                        </h1>
                        <div className="flex items-center text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
                            <MapPin size={12} className="mr-1 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                            <span className="truncate">{localizacao}</span>
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm md:text-base mt-1 hidden sm:block">
                            {t("dashboard_hero_desc_panel_company")}
                        </p>
                    </div>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex flex-col sm:flex-row md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
                    <Link
                        href="/company/vacancies/new"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-xs sm:text-sm font-medium"
                    >
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                        {t("publish_vacancy")}
                    </Link>

                    <Link
                        href="/company/profile"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-xs sm:text-sm font-medium"
                    >
                        <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                        {t("my_profile_title")}
                    </Link>
                </div>

            </div>
        </div>
    );
}
