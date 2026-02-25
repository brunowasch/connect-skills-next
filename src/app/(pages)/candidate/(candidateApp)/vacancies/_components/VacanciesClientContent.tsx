"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchFilters } from "./SearchFilters";
import { VacancyTabs } from "./VacancyTabs";
import { SearchActionSection } from "./SearchActionSection";
import { VacancyCard } from "./VacancyCard";
import { Vacancy } from "@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy";

interface VacanciesClientContentProps {
    vagas: Vacancy[];
    areas: string[];
    count: number;
    isSearch: boolean;
    isAll: boolean;
    isFavorites: boolean;
    isHistory: boolean;
    allFavoritesCount: number;
    appliedCount: number;
}

export function VacanciesClientContent({
    vagas,
    areas,
    count,
    isSearch,
    isAll,
    isFavorites,
    isHistory,
    allFavoritesCount,
    appliedCount
}: VacanciesClientContentProps) {
    const { t } = useTranslation();
    const [historyFilter, setHistoryFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');

    const getTitle = () => {
        if (isHistory) return isSearch ? t("search_applications") : t("your_applied_vacancies");
        if (isFavorites) return isSearch ? t("search_favorites") : t("your_favorite_vacancies");
        if (isSearch) return t("search_results");
        if (isAll) return t("all_available_vacancies");
        return t("recommended_for_you");
    };

    const getDescription = () => {
        if (isHistory) return t("history_empty_desc");
        if (isFavorites) return t("favorites_empty_desc");
        if (isAll) return t("all_vacancies_desc");
        return t("recommended_vacancies_desc");
    };

    const getEmptyMessage = () => {
        if (isHistory) return isSearch ? t("no_applications_found_search") : t("no_applications_yet");
        if (isFavorites) return isSearch ? t("no_favorites_found_search") : t("no_favorites_yet");
        if (isSearch) return t("no_vacancies_found_search");
        return t("no_recommended_vacancies");
    };

    let filteredVagas = [...vagas];
    if (isHistory) {
        if (historyFilter === 'APPROVED') {
            filteredVagas = filteredVagas.filter(v => v.feedbackStatus === 'APPROVED');
        } else if (historyFilter === 'REJECTED') {
            filteredVagas = filteredVagas.filter(v => v.feedbackStatus === 'REJECTED');
        }

        // Sort rejected to bottom only when showing ALL
        if (historyFilter === 'ALL') {
            filteredVagas.sort((a, b) => {
                const isRejectedA = a.feedbackStatus === 'REJECTED';
                const isRejectedB = b.feedbackStatus === 'REJECTED';
                if (isRejectedA && !isRejectedB) return 1;
                if (!isRejectedA && isRejectedB) return -1;
                return 0;
            });
        }
    }

    return (
        <main className="w-full min-w-0 overflow-hidden py-2 sm:py-4 md:py-6">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("vacancies_title")}</h1>
                <p className="text-gray-500">{t("vacancies_subtitle")}</p>
            </div>

            <SearchFilters />

            <VacancyTabs initialCount={allFavoritesCount} appliedCount={appliedCount} />

            <div className="flex flex-row items-center justify-between gap-2 mb-2 sm:mb-4">
                <h2 className="text-sm sm:text-lg font-bold text-gray-900">
                    {getTitle()}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {count} {isHistory ? t("applications_count") : t("found_count")}
                </span>
            </div>
            <p className="text-gray-500 mb-3 sm:mb-5 text-xs sm:text-sm md:text-base break-words">
                {getDescription()}
            </p>
            <SearchActionSection />

            {!isSearch && areas.length < 1 && (
                <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-xl flex items-center justify-between mb-4 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <i className="bi bi-exclamation-triangle-fill text-amber-500 text-xl"></i>
                        <div>
                            <p className="font-semibold text-amber-900 text-sm sm:text-base">{t("no_vacancies_found")}</p>
                            <p className="text-xs sm:text-sm text-amber-700">{t("select_areas_to_find")}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Vagas */}
            {vagas.length === 0 ? (
                <div className="text-center py-10 sm:py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm sm:text-base">
                        {getEmptyMessage()}
                    </p>
                </div>
            ) : (
                <>
                    {isHistory && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            <button
                                onClick={() => setHistoryFilter('ALL')}
                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                                    ${historyFilter === 'ALL'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {t("all")}
                            </button>
                            <button
                                onClick={() => setHistoryFilter('APPROVED')}
                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer
                                    ${historyFilter === 'APPROVED'
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${historyFilter === 'APPROVED' ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
                                {t("approved")}
                            </button>
                            <button
                                onClick={() => setHistoryFilter('REJECTED')}
                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer
                                    ${historyFilter === 'REJECTED'
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${historyFilter === 'REJECTED' ? 'bg-red-500' : 'bg-red-400'}`}></span>
                                {t("not_listed")}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full overflow-hidden">
                        {filteredVagas.map((vaga) => (
                            <VacancyCard key={vaga.id} vaga={vaga} />
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
