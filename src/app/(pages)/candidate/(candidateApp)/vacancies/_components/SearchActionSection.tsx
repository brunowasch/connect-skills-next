"use client";

import { useState } from "react";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function SearchActionSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const isAll = searchParams.get("all") === "true";

    const handleBackToRecommended = () => {
        router.push("/candidate/vacancies");
    };

    return (
        <>
            <div className="flex items-center mb-6">
                {isAll ? (
                    <button
                        onClick={handleBackToRecommended}
                        className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all group cursor-pointer"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar para vagas recomendadas
                    </button>
                ) : (
                    <>
                        <p className="text-gray-500 font-medium">Não encontrou o que esperava?</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-500 px-2 font-bold cursor-pointer hover:underline transition-all hover:text-blue-700"
                        >
                            Quero procurar novas vagas
                        </button>
                    </>
                )}
            </div>

            <GlobalSearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
