"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';

export function MentorDashboardHeader() {
    const { t } = useTranslation();

    return (
        <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t("mentor_dashboard_title", "Dashboard")}</h1>
            <p className="text-gray-500 text-sm sm:text-base">{t("mentor_dashboard_subtitle", "Gerencie suas mentorias e compartilhe seu conhecimento.")}</p>
        </div>
    );
}
