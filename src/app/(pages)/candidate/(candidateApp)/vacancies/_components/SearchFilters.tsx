"use client";

import { Search, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SearchFilters() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [location, setLocation] = useState(searchParams.get("loc") || "");
    const [type, setType] = useState(searchParams.get("type") || "");

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (search) params.set("q", search);
        else params.delete("q");

        if (location) params.set("loc", location);
        else params.delete("loc");

        if (type) params.set("type", type);
        else params.delete("type");

        router.push(`?${params.toString()}`);
    };

    return (
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 mb-4 sm:mb-8 w-full overflow-hidden">
            <div className="flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-12 w-full">

                {/* Busca */}
                <div className="lg:col-span-5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                        type="text"
                        placeholder={t("search_placeholder")}
                        className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                {/* Localização */}
                <div className="lg:col-span-4 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                        type="text"
                        placeholder={t("location_placeholder")}
                        className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                {/* Tipo + Botão */}
                <div className="lg:col-span-3 flex gap-2 w-full">
                    <select
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base cursor-pointer"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">{t("all_types")}</option>
                        <option value="Presencial">{t("Presencial")}</option>
                        <option value="Home_Office">{t("Home Office")}</option>
                        <option value="H_brido">{t("Híbrido")}</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center shadow-lg shadow-blue-200 min-w-[48px]"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
