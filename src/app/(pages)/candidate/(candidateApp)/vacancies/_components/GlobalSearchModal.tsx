"use client";

import { X, Search, Briefcase, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");

    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGlobalSearch = () => {
        const params = new URLSearchParams();
        params.set("all", "true");
        if (search) params.set("q", search);
        if (location) params.set("loc", location);

        router.push(`?${params.toString()}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] sm:max-h-none overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
                    <div>
                        <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">{t("search_all_vacancies")}</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t("explore_beyond_recommended")}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="bg-blue-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100 flex gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Briefcase size={16} className="sm:w-5 sm:h-5" />
                        </div>
                        <p className="text-xs sm:text-sm text-blue-800/80 leading-relaxed font-medium">
                            {t("global_search_hint")}
                        </p>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">{t("what_are_you_looking_for")}</label>
                            <div className="relative group">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder={t("global_search_placeholder")}
                                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">{t("where_optional")}</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder={t("global_location_placeholder")}
                                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-slate-50/50 border-t border-slate-100 flex gap-2 sm:gap-3 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer text-sm sm:text-base"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={handleGlobalSearch}
                        className="flex-[2] bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer text-sm sm:text-base"
                    >
                        {t("see_global_results")}
                    </button>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
