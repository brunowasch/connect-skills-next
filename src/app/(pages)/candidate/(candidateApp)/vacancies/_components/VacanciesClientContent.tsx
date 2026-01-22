"use client";

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

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("vacancies_title")}</h1>
                <p className="text-gray-500">{t("vacancies_subtitle")}</p>
            </div>

            <SearchFilters />

            <VacancyTabs initialCount={allFavoritesCount} appliedCount={appliedCount} />

            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                    {getTitle()}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {count} {isHistory ? t("applications_count") : t("found_count")}
                </span>
            </div>
            <p className="text-gray-500 mb-5">
                {getDescription()}
            </p>
            <SearchActionSection />

            {!isSearch && areas.length < 1 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <i className="bi bi-exclamation-triangle-fill text-amber-500 text-xl"></i>
                        <div>
                            <p className="font-semibold text-amber-900">{t("no_vacancies_found")}</p>
                            <p className="text-sm text-amber-700">{t("select_areas_to_find")}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Vagas */}
            {vagas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">
                        {getEmptyMessage()}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vagas.map((vaga) => (
                        <VacancyCard key={vaga.id} vaga={vaga} />
                    ))}
                </div>
            )}
        </main>
    );
}
