"use client";

import { useState, useMemo, useEffect } from "react";
import skillsData from "@/src/data/skills.json";
import { FiSearch, FiArrowLeft, FiSave } from "react-icons/fi";
import { useRouter } from "next/navigation";


interface EditAreasProps {
    initialAreas: string[];
}

export function EditAreas({ initialAreas }: EditAreasProps) {
    const router = useRouter();
    const [selectedSkills, setSelectedSkills] = useState<string[]>(initialAreas);
    const [searchTerm, setSearchTerm] = useState("");
    const [customSkills, setCustomSkills] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Identify which selected skills are NOT in the default skills data
    useEffect(() => {
        const defaultSkills = new Set(skillsData.Skills);
        const extra = initialAreas.filter(skill => !defaultSkills.has(skill));
        setCustomSkills(extra);
    }, [initialAreas]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const handleAddCustomSkill = () => {
        if (newSkill.trim()) {
            const skillName = newSkill.trim();
            if (!customSkills.includes(skillName) && !skillsData.Skills.includes(skillName)) {
                setCustomSkills((prev) => [...prev, skillName]);
                setSelectedSkills((prev) => [...prev, skillName]);
            } else if (!selectedSkills.includes(skillName)) {
                setSelectedSkills((prev) => [...prev, skillName]);
            }
            setNewSkill("");
            setIsModalOpen(false);
        }
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
                throw new Error(errorData.error || "Erro ao salvar especialidades");
            }

            localStorage.setItem('global_toast', JSON.stringify({
                type: 'success',
                text: "Especialidades atualizadas!"
            }));
            router.push("/candidate/profile");
            router.refresh();
        } catch (error: any) {
            console.error("Erro ao salvar áreas:", error);
            // For errors, we can show an alert or a toast immediately if we're not redirecting
            localStorage.setItem('global_toast', JSON.stringify({
                type: 'error',
                text: error.message || "Ocorreu um erro ao salvar suas especialidades."
            }));
            // We might need a small hack to trigger the storage event if it's the same page
            window.dispatchEvent(new Event('storage'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const allSkills = useMemo(() => {
        const uniqueSkills = Array.from(new Set([...skillsData.Skills, ...customSkills])).sort();
        return uniqueSkills;
    }, [customSkills]);

    const filteredSkills = allSkills.filter((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-6 gap-6 w-full max-w-5xl mx-auto pb-32">
            <div className="w-full flex items-center justify-between mb-2">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                    <FiArrowLeft /> Voltar
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900">Editar Especialidades</h1>
                    <p className="text-sm text-gray-500">Mantenha seu perfil atualizado</p>
                </div>
            </div>

            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar habilidades..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <span className="font-bold text-blue-600">{selectedSkills.length}</span> selecionadas
                    </div>
                </div>

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
                            {skill}
                        </button>
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-3 rounded-xl text-sm text-center transition-all duration-200 border bg-white text-blue-600 border-dashed border-blue-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 font-bold"
                    >
                        + Adicionar Outra
                    </button>
                </div>

                {filteredSkills.length === 0 && searchTerm && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Nenhuma habilidade encontrada para "{searchTerm}"</p>
                        <button
                            onClick={() => {
                                setNewSkill(searchTerm);
                                setIsModalOpen(true);
                            }}
                            className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                            Deseja adicionar "{searchTerm}"?
                        </button>
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
                        Limpar seleção
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 active:scale-95 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <FiSave /> Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Nova Especialidade</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Adicione uma habilidade personalizada que não está na lista.
                            </p>
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Ex: React, UX Design, Gestão..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 text-gray-700"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddCustomSkill}
                                    disabled={!newSkill.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
