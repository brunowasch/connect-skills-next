"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';

export function DashboardHeader() {
    const { t } = useTranslation();

    return (
        <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("company_dashboard_title")}</h1>
            <p className="text-gray-500">{t("company_dashboard_subtitle")}</p>
        </div>
    );
}
