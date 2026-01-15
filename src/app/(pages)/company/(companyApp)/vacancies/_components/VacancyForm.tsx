"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Sparkles, Search, X, PlusCircle, FileText, Trash2, Upload, Eye, Link as LinkIcon } from "lucide-react";
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

interface VacancyLink {
    id?: string;
    titulo: string;
    url: string;
    ordem?: number;
}

interface VacancyFile {
    id?: string;
    nome: string;
    mime?: string;
    tamanho?: number;
    url?: string;
    base64?: string;
    type?: string;
    size?: number;
}

interface VacancyFormProps {
    areas: Area[];
    softSkills: SoftSkill[];
    initialData?: any;
    vacancyId?: string;
    companyProfile?: {
        cidade: string | null;
        estado: string | null;
        pais: string | null;
    } | null;
}

export function VacancyForm({ areas, softSkills, initialData, vacancyId, companyProfile }: VacancyFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [searchArea, setSearchArea] = useState("");
    const [searchSoftSkill, setSearchSoftSkill] = useState("");
    const isEdit = !!vacancyId;

    // Parse existing options safely
    const existingOptions = initialData?.opcao ? JSON.parse(initialData.opcao) : {};

    // Inclusivity might be the whole 'opcao' if it's old data, or nested in 'inclusivity'
    const initialInclusivity = existingOptions.pcd !== undefined ? existingOptions : (existingOptions.inclusivity || {
        pcd: false,
        blackPeople: false,
        women: false,
        lgbt: false
    });

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
        inclusivity: initialInclusivity,
        vinculo_empregaticio: initialData?.vinculo_empregaticio || "CLT_Tempo_Integral",
        areas: initialData?.vaga_area?.map((va: any) => va.area_interesse_id) || [] as number[],
        softSkills: initialData?.vaga_soft_skill?.map((vss: any) => vss.soft_skill_id) || [] as number[],
        // Localização (armazenada no campo 'opcao' como JSON)
        cidade: existingOptions.cidade || (!isEdit ? (companyProfile?.cidade || "") : ""),
        estado: existingOptions.estado || (!isEdit ? (companyProfile?.estado || "") : ""),
        pais: existingOptions.pais || (!isEdit ? (companyProfile?.pais || "Brasil") : "Brasil"),
        useProfileLocation: !isEdit && !!companyProfile?.cidade,
        // Anexos e Links
        anexos: (initialData?.vaga_arquivo || []) as VacancyFile[],
        links: (initialData?.vaga_link || []) as VacancyLink[]
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

    const toggleInclusivity = (key: string) => {
        setFormData(prev => ({
            ...prev,
            inclusivity: {
                ...prev.inclusivity,
                [key]: !prev.inclusivity[key as keyof typeof prev.inclusivity]
            }
        }));
    };

    const handleUseProfileLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            useProfileLocation: checked,
            cidade: checked ? (companyProfile?.cidade || prev.cidade) : prev.cidade,
            estado: checked ? (companyProfile?.estado || prev.estado) : prev.estado,
            pais: checked ? (companyProfile?.pais || prev.pais) : prev.pais,
        }));
    };

    // --- Gestão de Anexos ---
    const handleAnexosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newAnexos = [...formData.anexos];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            const filePromise = new Promise<{ nome: string, base64: string, size: number, type: string }>((resolve) => {
                reader.onloadend = () => {
                    resolve({
                        nome: file.name,
                        base64: reader.result as string,
                        size: file.size,
                        type: file.type
                    });
                };
            });

            reader.readAsDataURL(file);
            const result = await filePromise;
            newAnexos.push(result);
        }

        setFormData(prev => ({ ...prev, anexos: newAnexos }));
    };

    const removeAnexo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            anexos: prev.anexos.filter((_, i) => i !== index)
        }));
    };

    const handleViewAttachment = (anexo: VacancyFile) => {
        const url = anexo.url || anexo.base64;
        const name = anexo.nome || 'Arquivo';

        if (!url) return;

        const mime = (anexo.mime || anexo.type || '').toLowerCase();
        const lowerName = name.toLowerCase();
        const lowerUrl = url.toLowerCase();

        const isPdf = mime.includes('pdf') ||
            lowerUrl.includes('.pdf') ||
            lowerUrl.includes('/pdf') ||
            lowerName.endsWith('.pdf');

        const isCloudinary = url.includes('cloudinary.com');

        if (url.startsWith('data:')) {
            const fileKey = `temp_file_${Date.now()}`;
            sessionStorage.setItem(fileKey, url);
            const typeParam = isPdf ? '&type=application/pdf' : '';
            window.open(`/viewer?fileKey=${fileKey}&title=${encodeURIComponent(name)}${typeParam}`, '_blank');
        } else {
            let finalUrl = url;
            let typeParam = '';

            if (isPdf) {
                if (isCloudinary) {
                    finalUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                }
                typeParam = '&type=application/pdf';
            }

            window.open(`/viewer?url=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(name)}${typeParam}`, '_blank');
        }
    };

    // --- Gestão de Links ---
    const addLink = () => {
        setFormData(prev => ({
            ...prev,
            links: [...prev.links, { titulo: '', url: '' }]
        }));
    };

    const updateLink = (index: number, field: 'titulo' | 'url', value: string) => {
        const newLinks = [...formData.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, links: newLinks }));
    };

    const removeLink = (index: number) => {
        if (formData.links.length === 0) return;
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
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
                descricao: formData.candidatoIdeal
                    ? `${formData.descricao}\n\n### Perfil do Candidato Ideal\n${formData.candidatoIdeal}`
                    : formData.descricao,
                opcao: {
                    ...formData.inclusivity,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    pais: formData.pais
                }
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

                    {/* Localização da Vaga */}
                    <div className="md:col-span-2 space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Search size={16} className="text-blue-500" /> Localização da Vaga
                            </label>
                            {companyProfile && (
                                <label className="flex items-center gap-2 text-xs font-semibold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.useProfileLocation}
                                        onChange={handleUseProfileLocation}
                                        className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                                    />
                                    Usar localidade definida em meu perfil
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    name="cidade"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    placeholder="Cidade"
                                    disabled={formData.useProfileLocation}
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    name="estado"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    placeholder="UF"
                                    maxLength={2}
                                    disabled={formData.useProfileLocation}
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    name="pais"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                    value={formData.pais}
                                    onChange={handleChange}
                                    placeholder="País"
                                    disabled={formData.useProfileLocation}
                                />
                            </div>
                        </div>
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
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Inclusão e Diversidade</h3>
                <p className="text-sm text-gray-600">Marque as opções abaixo se esta for uma vaga afirmativa ou exclusiva para grupos específicos.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.inclusivity.women}
                            onChange={() => toggleInclusivity('women')}
                            className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Vaga Afirmativa para Mulheres
                        </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.inclusivity.blackPeople}
                            onChange={() => toggleInclusivity('blackPeople')}
                            className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        />
                        <span className="text-sm font-medium text-gray-700">Vaga Afirmativa para Pessoas Negras</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.inclusivity.pcd}
                            onChange={() => toggleInclusivity('pcd')}
                            className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        />
                        <span className="text-sm font-medium text-gray-700">Vaga para PcD</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.inclusivity.lgbt}
                            onChange={() => toggleInclusivity('lgbt')}
                            className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        />
                        <span className="text-sm font-medium text-gray-700">Vaga para LGBTQIAPN+</span>
                    </label>
                </div>
            </div>

            {/* Anexos e Links Section */}
            <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm shadow-blue-50/50">
                <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-2">
                    <FileText size={18} className="text-blue-600" />
                    <h3 className="text-base uppercase tracking-wider">Materiais Complementares</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Anexos */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                                <Upload size={14} /> Arquivos ({formData.anexos.length})
                            </h4>
                            <input
                                type="file"
                                id="vaga-anexos"
                                multiple
                                className="hidden"
                                onChange={handleAnexosChange}
                                accept=".pdf,.doc,.docx,image/*"
                            />
                            <label htmlFor="vaga-anexos" className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors bg-blue-50 px-2 py-1 rounded">
                                + Adicionar
                            </label>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {formData.anexos.length === 0 && (
                                <p className="text-xs text-gray-400 italic">Nenhum arquivo anexado.</p>
                            )}
                            {formData.anexos.map((anexo, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm animate-in fade-in slide-in-from-left-2 transition-all hover:border-blue-200">
                                    <span className="text-xs text-gray-600 truncate max-w-[150px]">{anexo.nome}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleViewAttachment(anexo)}
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                            title="Visualizar"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeAnexo(idx)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                            title="Remover"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                                <LinkIcon size={14} /> Links Úteis ({formData.links.length})
                            </h4>
                            <button
                                type="button"
                                onClick={addLink}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors bg-blue-50 px-2 py-1 rounded"
                            >
                                + Adicionar
                            </button>
                        </div>

                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {formData.links.length === 0 && (
                                <p className="text-xs text-gray-400 italic">Nenhum link adicionado.</p>
                            )}
                            {formData.links.map((link, idx) => (
                                <div key={idx} className="space-y-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Título (ex: Portfólio)"
                                            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={link.titulo}
                                            onChange={(e) => updateLink(idx, 'titulo', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeLink(idx)}
                                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={link.url}
                                        onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
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
