"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Star, LayoutGrid } from "lucide-react";

export function VacancyTabs() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get("tab") || "explore";

    const setTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === "explore") {
            params.delete("tab");
        } else {
            params.set("tab", tab);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-1 mb-6 border-b border-gray-100">
            <button
                onClick={() => setTab("explore")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${currentTab === "explore"
                    ? "text-blue-600 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    }`}
            >
                <LayoutGrid size={18} />
                Explorar Vagas
            </button>
            <button
                onClick={() => setTab("favorites")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${currentTab === "favorites"
                    ? "text-blue-600 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    }`}
            >
                <Star size={18} />
                Vagas Favoritas
            </button>
        </div>
    );
}
