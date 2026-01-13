"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = isEdit ? `/api/vacancies/${vacancyId}` : "/api/vacancies";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
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
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Informações Principais</h3>

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
                            placeholder="Ex: Desenvolvedor Front-end Senior"
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
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Segmentação</h3>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Especialidades requeridas (Selecione ao menos uma)</label>
                    <div className="h-48 overflow-y-auto border border-gray-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50/50">
                        {areas.map(area => (
                            <button
                                type="button"
                                key={area.id}
                                onClick={() => toggleArea(area.id)}
                                className={`text-left text-xs px-3 py-2 rounded-md transition-colors cursor-pointer ${formData.areas.includes(area.id)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}
                            >
                                {area.nome}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Soft Skills (Desejáveis)</label>
                    <div className="h-40 overflow-y-auto border border-gray-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50/50">
                        {softSkills.map(skill => (
                            <button
                                type="button"
                                key={skill.id}
                                onClick={() => toggleSkill(skill.id)}
                                className={`text-left text-xs px-3 py-2 rounded-md transition-colors cursor-pointer ${formData.softSkills.includes(skill.id)
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
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

        </form>
    );
}
