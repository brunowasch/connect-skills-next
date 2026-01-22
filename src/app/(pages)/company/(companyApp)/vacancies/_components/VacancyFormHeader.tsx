"use client";

import { useTranslation } from "react-i18next";

interface VacancyFormHeaderProps {
    mode: 'create' | 'edit';
}

export function VacancyFormHeader({ mode }: VacancyFormHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
                {mode === 'create' ? t('publish_vacancy_title') : t('edit_vacancy_title')}
            </h1>
            <p className="text-gray-500">
                {mode === 'create' ? t('publish_vacancy_subtitle') : t('edit_vacancy_subtitle')}
            </p>
        </div>
    );
}
