"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { RankingList } from "./RankingList";

interface RankingPageContentProps {
    state: 'no_selection' | 'not_found' | 'success';
    vacancy?: {
        cargo: string;
    } | null;
    candidates?: any[];
    vacancyId?: string;
}

export function RankingPageContent({ state, vacancy, candidates, vacancyId }: RankingPageContentProps) {
    const { t } = useTranslation();

    const renderContent = () => {
        if (state === 'no_selection') {
            return (
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('ranking_no_selection_title')}</h1>
                    <p className="text-gray-500 mt-2">{t('ranking_no_selection_desc')}</p>
                </div>
            );
        }
        if (state === 'not_found') {
            return (
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('ranking_not_found_title')}</h1>
                </div>
            );
        }

        return (
            <>
                <div className="mb-8">
                    <div className="mt-4">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {t('ranking_title_prefix')} <span className="text-blue-600">{vacancy?.cargo}</span>
                        </h1>
                        <p className="text-gray-500">{t('ranking_subtitle')}</p>
                    </div>
                </div>
                {candidates && vacancyId && <RankingList candidates={candidates} vacancyId={vacancyId} />}
            </>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-2" />
                {t('ranking_back_to_vacancies')}
            </Link>

            {renderContent()}
        </div>
    );
}
