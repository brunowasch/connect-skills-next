"use client";

import { useState, useMemo } from "react";
import skillsData from "@/src/data/skills.json";
import { FiSearch, FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface EditAreasProps {
    initialAreas: string[];
}

export function EditAreas({ initialAreas }: EditAreasProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedSkills, setSelectedSkills] = useState<string[]>(initialAreas);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const handleSave = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/candidate/areas", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    selectedAreas: selectedSkills,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t("error_saving_areas"));
            }

            localStorage.setItem('global_toast', JSON.stringify({
                type: 'success',
                text: t("success_areas_update")
            }));
            router.push("/candidate/profile");
            router.refresh();
        } catch (error: any) {
            console.error("Erro ao salvar áreas:", error);
            localStorage.setItem('global_toast', JSON.stringify({
                type: 'error',
                text: error.message || t("error_saving_areas")
            }));
            window.dispatchEvent(new Event('storage'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const allSkills = useMemo(() => {
        return [...skillsData.Skills].sort();
    }, []);

    const filteredSkills = allSkills.filter((skill) =>
        t(skill).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasChanges = useMemo(() => {
        if (selectedSkills.length !== initialAreas.length) return true;

        const sortedSelected = [...selectedSkills].sort();
        const sortedInitial = [...initialAreas].sort();

        return sortedSelected.some((skill, index) => skill !== sortedInitial[index]);
    }, [selectedSkills, initialAreas]);

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-6 gap-6 w-full max-w-5xl mx-auto pb-32">
            <div className="w-full flex items-center justify-between mb-2">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                    <FiArrowLeft /> {t("vacancy_back")}
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900">{t("edit_areas_title")}</h1>
                    <p className="text-sm text-gray-500">{t("edit_areas_subtitle")}</p>
                </div>
            </div>

            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("search_skills_placeholder")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <span className="font-bold text-blue-600">{selectedSkills.length}</span> {t("selected_suffix")}
                    </div>
                </div>

                {/* Selected Skills Tags */}
                {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 pb-4 border-b border-gray-100">
                        {selectedSkills.map((skill) => (
                            <div
                                key={skill}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                            >
                                {t(skill)}
                                <button
                                    onClick={() => toggleSkill(skill)}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                    aria-label={`Remove ${skill}`}
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                    {filteredSkills.map((skill) => (
                        <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`p-3 rounded-xl text-sm text-center transition-all duration-200 border font-medium cursor-pointer ${selectedSkills.includes(skill)
                                ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                        >
                            {t(skill)}
                        </button>
                    ))}
                </div>

                {filteredSkills.length === 0 && searchTerm && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">{t("no_skills_found_prefix")} &quot;{searchTerm}&quot;</p>
                    </div>
                )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setSelectedSkills([])}
                        disabled={selectedSkills.length === 0}
                        className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                        {t("clean_selection_btn")}
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            {t("cancel_btn")}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting || !hasChanges}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 cursor-pointer 
                                ${isSubmitting || !hasChanges
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"}`
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t("saving_btn")}
                                </>
                            ) : (
                                <>
                                    <FiSave /> {t("save_changes")}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
