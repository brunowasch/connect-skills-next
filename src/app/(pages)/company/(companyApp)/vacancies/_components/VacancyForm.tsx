"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Sparkles, Search, X } from "lucide-react";
import Link from "next/link";
import { AIGenerationModal } from "./AIGenerationModal";
import { generateVacancyAI } from "@/src/app/actions/generateVacancyAI";

interface Area {
    id: number;
    nome: string | null;
}

interface SoftSkill {
    id: number;
    nome: string;
}

interface VacancyFormProps {
    areas: Area[];
    softSkills: SoftSkill[];
    initialData?: any;
    vacancyId?: string;
}

export function VacancyForm({ areas, softSkills, initialData, vacancyId }: VacancyFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [searchArea, setSearchArea] = useState("");
    const [searchSoftSkill, setSearchSoftSkill] = useState("");
    const isEdit = !!vacancyId;

    const [formData, setFormData] = useState({
        cargo: initialData?.cargo || "",
        tipo_local_trabalho: initialData?.tipo_local_trabalho || "Presencial",
        escala_trabalho: initialData?.escala_trabalho || "Integral",
        dias_presenciais: initialData?.dias_presenciais || "",
        dias_home_office: initialData?.dias_home_office || "",
        salario: initialData?.salario || "",
        moeda: initialData?.moeda || "BRL",
        descricao: initialData?.descricao || "",
        beneficio: initialData?.beneficio || "",
        pergunta: initialData?.pergunta || "",
        candidatoIdeal: "",
        vinculo_empregaticio: initialData?.vinculo_empregaticio || "CLT_Tempo_Integral",
        areas: initialData?.vaga_area?.map((va: any) => va.area_interesse_id) || [] as number[],
        softSkills: initialData?.vaga_soft_skill?.map((vss: any) => vss.soft_skill_id) || [] as number[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleArea = (id: number) => {
        setFormData(prev => {
            const current = prev.areas;
            if (current.includes(id)) {
                return { ...prev, areas: current.filter((i: number) => i !== id) };
            } else {
                return { ...prev, areas: [...current, id] };
            }
        });
    };

    const toggleSkill = (id: number) => {
        setFormData(prev => {
            const current = prev.softSkills;
            if (current.includes(id)) {
                return { ...prev, softSkills: current.filter((i: number) => i !== id) };
            } else {
                return { ...prev, softSkills: [...current, id] };
            }
        });
    };

    const handleAIGenerate = async (shortDesc: string) => {
        try {
            const allAreaNames = areas
                .filter(a => a.nome)
                .map(a => a.nome as string);

            const allSoftSkillNames = softSkills
                .filter(s => s.nome)
                .map(s => s.nome as string);

            const result = await generateVacancyAI({
                shortDesc,
                skills: allAreaNames,
                softSkills: allSoftSkillNames
            });

            setFormData(prev => {
                const newAreaIds = [...prev.areas];
                const newSoftSkillIds = [...prev.softSkills];

                const findAreaId = (name: string) => areas.find(a => a.nome?.toLowerCase() === name.toLowerCase())?.id;
                const findSoftSkillId = (name: string) => softSkills.find(s => s.nome.toLowerCase() === name.toLowerCase())?.id;

                result.requiredSkills.forEach((skillName: string) => {
                    const id = findAreaId(skillName);
                    if (id && !newAreaIds.includes(id)) newAreaIds.push(id);
                });

                result.behaviouralSkills.forEach((skillName: string) => {
                    const id = findSoftSkillId(skillName);
                    if (id && !newSoftSkillIds.includes(id)) newSoftSkillIds.push(id);
                });

                const formattedQuestions = result.questions.join('\n');

                return {
                    ...prev,
                    cargo: result.jobTitle,
                    descricao: result.longDescription,
                    candidatoIdeal: result.bestCandidate,
                    pergunta: formattedQuestions,
                    areas: newAreaIds,
                    softSkills: newSoftSkillIds
                };
            });
        } catch (error) {
            console.error("Error generating vacancy:", error);
            alert("Erro ao gerar conteúdo com IA. Tente novamente.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = isEdit ? `/api/vacancies/${vacancyId}` : "/api/vacancies";
            const method = isEdit ? "PUT" : "POST";

            const payload = {
                ...formData,
                // Append Candidate Ideal to description only if it has content
                descricao: formData.candidatoIdeal
                    ? `${formData.descricao}\n\n### Perfil do Candidato Ideal\n${formData.candidatoIdeal}`
                    : formData.descricao
            };

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Falha ao salvar vaga");

            router.push("/company/vacancies");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Erro ao publicar vaga.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-xl shadow-blue-50/50">

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Informações Principais</h3>
                    <button
                        type="button"
                        onClick={() => setIsAIModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:shadow-lg shadow-blue-500/30 transition-all hover:scale-105 cursor-pointer"
                    >
                        <Sparkles size={14} />
                        IA Assist
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cargo / Título da Vaga</label>
                        <input
                            type="text"
                            name="cargo"
                            required
                            value={formData.cargo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Ex: Vendedor de automóveis"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Modelo de Trabalho</label>
                        <select
                            name="tipo_local_trabalho"
                            value={formData.tipo_local_trabalho}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="Presencial">Presencial</option>
                            <option value="Home_Office">Home Office</option>
                            <option value="H_brido">Híbrido</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Vínculo</label>
                        <select
                            name="vinculo_empregaticio"
                            value={formData.vinculo_empregaticio}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="CLT_Tempo_Integral">CLT (Integral)</option>
                            <option value="CLT_Meio_Periodo">CLT (Meio Período)</option>
                            <option value="PJ">PJ</option>
                            <option value="Estagio">Estágio</option>
                            <option value="Trainee">Trainee</option>
                            <option value="Freelancer_Autonomo">Freelancer</option>
                            <option value="Temporario">Temporário</option>
                            <option value="Aprendiz">Aprendiz</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Salário</label>
                            <input
                                type="number"
                                name="salario"
                                value={formData.salario}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Moeda</label>
                            <select
                                name="moeda"
                                value={formData.moeda}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="BRL">BRL (R$)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Detalhes</h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Descrição da Vaga</label>
                    <textarea
                        name="descricao"
                        required
                        value={formData.descricao}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        placeholder="Descreva as responsabilidades, requisitos obrigatórios e desejáveis..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Benefícios</label>
                    <textarea
                        name="beneficio"
                        value={formData.beneficio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        placeholder="Vale refeição, plano de saúde, gympass..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Recrutamento Inteligente</h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Perfil do Candidato Ideal</label>
                    <textarea
                        name="candidatoIdeal"
                        value={formData.candidatoIdeal}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        placeholder="Ex: O candidato ideal para essa vaga deve ter experiência prévia em vendas de automóveis..."
                    />
                    <p className="text-xs text-gray-500">* Este texto será anexado à descrição da vaga ao salvar.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Perguntas para Entrevista</label>
                    <textarea
                        name="pergunta"
                        value={formData.pergunta}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        placeholder="Perguntas técnicas e comportamentais..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Segmentação</h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Especialidades requeridas (Selecione ao menos uma)</label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchArea}
                            onChange={(e) => setSearchArea(e.target.value)}
                            placeholder="Pesquisar especialidade..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {formData.areas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {areas.filter(a => formData.areas.includes(a.id)).map(area => (
                                <span key={area.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {area.nome}
                                    <button
                                        type="button"
                                        onClick={() => toggleArea(area.id)}
                                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="h-64 overflow-y-auto border border-gray-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50/50 content-start">
                        {areas
                            .filter(area => area.nome?.toLowerCase().includes(searchArea.toLowerCase()))
                            .map(area => (
                                <button
                                    type="button"
                                    key={area.id}
                                    onClick={() => toggleArea(area.id)}
                                    className={`text-center text-xs px-3 py-2 rounded-md transition-colors cursor-pointer border h-full flex items-center justify-center ${formData.areas.includes(area.id)
                                        ? 'bg-blue-600 text-white shadow-sm border-transparent'
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    {area.nome}
                                </button>
                            ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Soft Skills (Desejáveis)</label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchSoftSkill}
                            onChange={(e) => setSearchSoftSkill(e.target.value)}
                            placeholder="Pesquisar soft skill..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {formData.softSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {softSkills.filter(s => formData.softSkills.includes(s.id)).map(skill => (
                                <span key={skill.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                    {skill.nome}
                                    <button
                                        type="button"
                                        onClick={() => toggleSkill(skill.id)}
                                        className="hover:bg-purple-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="h-64 overflow-y-auto border border-gray-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50/50 content-start">
                        {softSkills
                            .filter(skill => skill.nome.toLowerCase().includes(searchSoftSkill.toLowerCase()))
                            .map(skill => (
                                <button
                                    type="button"
                                    key={skill.id}
                                    onClick={() => toggleSkill(skill.id)}
                                    className={`text-center text-xs px-3 py-2 rounded-md transition-colors cursor-pointer border h-full flex items-center justify-center ${formData.softSkills.includes(skill.id)
                                        ? 'bg-purple-600 text-white shadow-sm border-transparent'
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    {skill.nome}
                                </button>
                            ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Link
                    href="/company/vacancies"
                    className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                    <span className="relative top-[1px]">{isEdit ? "Salvar Alterações" : "Publicar Vaga"}</span>
                </button>
            </div>

            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGenerate}
            />
        </form>
    );
}
