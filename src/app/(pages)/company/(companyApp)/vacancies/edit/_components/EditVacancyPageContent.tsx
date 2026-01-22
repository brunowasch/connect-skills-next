"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VacancyForm } from "../../_components/VacancyForm";

interface EditVacancyPageContentProps {
    state: 'no_selection' | 'not_found' | 'success';
    areas?: any[];
    softSkills?: any[];
    initialData?: any;
    vacancyId?: string;
    companyProfile?: any;
}

export function EditVacancyPageContent({
    state,
    areas,
    softSkills,
    initialData,
    vacancyId,
    companyProfile
}: EditVacancyPageContentProps) {
    const { t } = useTranslation();

    if (state === 'no_selection') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    {t('ranking_back_to_vacancies')}
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('ranking_no_selection_title')}</h1>
                    <p className="text-gray-500 mt-2">{t('edit_no_selection_desc')}</p>
                </div>
            </div>
        );
    }

    if (state === 'not_found') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    {t('ranking_back_to_vacancies')}
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('ranking_not_found_title')}</h1>
                    <p className="text-gray-500 mt-2">{t('edit_not_found_desc')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    {t('ranking_back_to_vacancies')}
                </Link>
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">{t('edit_vacancy_title')}</h1>
                    <p className="text-gray-500">{t('edit_vacancy_subtitle')}</p>
                </div>
            </div>

            {initialData && (
                <VacancyForm
                    areas={areas || []}
                    softSkills={softSkills || []}
                    initialData={initialData}
                    vacancyId={vacancyId!}
                    companyProfile={companyProfile}
                />
            )}
        </div>
    );
}
