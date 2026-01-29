"use client";

import { useState } from "react";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SearchActionSection() {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const isAll = searchParams.get("all") === "true";

    const handleBackToRecommended = () => {
        router.push("/candidate/vacancies");
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 w-full min-w-0 overflow-hidden">
                {isAll ? (
                    <button
                        onClick={handleBackToRecommended}
                        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-blue-600 font-bold hover:bg-blue-50 active:bg-blue-100 px-4 py-2.5 sm:py-2 rounded-xl border border-blue-100 transition-all group cursor-pointer text-sm sm:text-base"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {t("back_to_recommended")}
                    </button>
                ) : (
                    <div className="w-full flex flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-center sm:text-left flex-wrap">
                        <p className="text-gray-500 font-medium text-xs sm:text-base">
                            {t("did_not_find_expected")}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-500 font-bold cursor-pointer hover:underline transition-all hover:text-blue-700 active:text-blue-800 text-xs sm:text-base"
                        >
                            {t("want_to_search_global")}
                        </button>
                    </div>
                )}
            </div>

            <GlobalSearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
