"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Briefcase, Star, History, Sparkles } from "lucide-react";

interface VacancyTabsProps {
    initialCount: number;
    appliedCount: number;
}

export function VacancyTabs({ initialCount, appliedCount }: VacancyTabsProps) {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const isFavorites = searchParams.get("tab")?.toLowerCase() === "favorites";
    const isHistory = searchParams.get("tab")?.toLowerCase() === "history";
    const isAll = searchParams.get("all") === "true";
    const isRecommended = !isFavorites && !isHistory && !isAll;

    const tabs = [
        {
            label: t("recommended_for_you"),
            href: "/candidate/vacancies",
            isActive: isRecommended,
            icon: Sparkles,
        },
        {
            label: t("explore_tab"),
            href: "/candidate/vacancies?all=true",
            isActive: isAll,
            icon: Briefcase,
        },
        {
            label: t("favorites_tab"),
            href: "/candidate/vacancies?tab=favorites",
            isActive: isFavorites,
            count: initialCount,
            icon: Star,
        },
        {
            label: t("history_tab"),
            href: "/candidate/vacancies?tab=history",
            isActive: isHistory,
            count: appliedCount,
            icon: History,
        },
    ];

    return (
        <div className="relative mb-4 sm:mb-8 overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide w-full">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`
                            flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 active:bg-gray-50
                            ${tab.isActive
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`
                                ml-1 sm:ml-1.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full
                                ${tab.isActive
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                }
                            `}>
                                {tab.count}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
