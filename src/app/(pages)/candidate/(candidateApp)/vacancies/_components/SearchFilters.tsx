"use client";

import { Search, MapPin, Filter } from "lucide-react";
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
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Busca por cargo/empresa */}
                <div className="md:col-span-5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={t("search_placeholder")}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                {/* Localização */}
                <div className="md:col-span-4 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={t("location_placeholder")}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                {/* Filtros e Botão */}
                <div className="md:col-span-3 flex gap-2">
                    <select
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm md:text-base cursor-pointer"
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
                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[44px] cursor-pointer"
                    >
                        <Search size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
