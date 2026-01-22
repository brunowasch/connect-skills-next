"use client";

import React from 'react';
import Link from 'next/link';
import { Rocket, Info, ChevronRight } from 'lucide-react';
import { CompanyProfileProps } from '@/src/app/(pages)/company/(companyApp)/types/CompanyProfileProps';
import { useTranslation } from "react-i18next";

export function ProfileCompletion({ company }: CompanyProfileProps) {
    const { t } = useTranslation();
    // Lógica de validação baseada no seu código EJS
    const hasNome = !!company.nome_empresa && company.nome_empresa.trim() !== '';
    const hasLocal = !!(company.cidade || company.estado || company.pais);
    const hasTel = !!(company.telefone && company.telefone.trim() !== '');

    const placeholders = ['/img/avatar.png', '/img/empresa-padrao.png', '/img/company-placeholder.png'];
    const hasFoto = !!(company.foto_perfil && !placeholders.includes(company.foto_perfil));

    const checklist = [hasNome, hasLocal, hasTel, hasFoto];
    const completion = Math.round((checklist.filter(Boolean).length / checklist.length) * 100);

    if (completion >= 100) return null;

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-100 mb-6 sm:mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm sm:text-base">
                    <Rocket size={20} className="text-blue-600" />
                    {t("dashboard_profile_company_title")}
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {completion}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completion}%` }}
                />
            </div>

            <div className="flex items-start gap-2 mb-4">
                <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-500 italic">
                    {t("dashboard_profile_company_hint")}
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {!hasNome && (
                    <Link href="/company/edit/profile" className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        {t("define_name")}
                    </Link>
                )}
                {!hasLocal && (
                    <Link href="/company/edit/profile" className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        {t("define_location")}
                    </Link>
                )}
                {!hasTel && (
                    <Link href="/company/edit/profile" className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        {t("add_phone")}
                    </Link>
                )}
                {!hasFoto && (
                    <Link href="/company/edit/profile" className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                        {t("add_logo")}
                    </Link>
                )}
            </div>
        </div>
    );
}