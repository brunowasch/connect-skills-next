"use client";

import {
    MapPin,
    Briefcase,
    Building2,
    Calendar,
    Users,
    Clock,
    Home,
    Globe,
    FileText,
    Link as LinkIcon,
    CheckCircle2,
    ExternalLink,
    Download,
    ArrowLeft,
    Copy,
    Check,
    HeartHandshake,
    Eye,
    Edit,
    Power,
    Unlock,
    Lock,
    BarChart3,
    X,
    AlertCircle,
    Trash2,
    Ban,
    ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { selectVacancyForRanking, selectVacancyForEditing } from "@/src/app/(pages)/company/(companyApp)/vacancies/actions";

interface ModalConfig {
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    confirmText: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
}

interface VacancyDetailsProps {
    vacancy: {
        id: string;
        cargo: string;
        tipo_local_trabalho: any;
        escala_trabalho: string;
        dias_presenciais?: number | null;
        dias_home_office?: number | null;
        salario?: any;
        moeda?: string | null;
        descricao: string;
        beneficio?: string | null;
        pergunta?: string | null;
        opcao?: string | null;
        created_at: Date;
        vinculo_empregaticio?: any;
        vaga_area?: Array<{
            area_interesse: {
                id: number;
                nome: string | null;
            };
        }>;
        vaga_arquivo?: Array<{
            id: string;
            nome: string;
            url: string;
            mime: string;
            tamanho: number;
        }>;
        vaga_link?: Array<{
            id: string;
            titulo: string;
            url: string;
        }>;
    };
    company: {
        nome_empresa: string;
        foto_perfil?: string | null;
        cidade?: string | null;
        estado?: string | null;
        pais?: string | null;
        descricao: string;
    } | null;
    isActive: boolean;
    applicationCount: number;
    userType?: string;
    isOwner?: boolean;
}

const tipoLocalTrabalhoMap: Record<string, { label: string; icon: any }> = {
    Presencial: { label: "Presencial", icon: Building2 },
    Home_Office: { label: "Home Office", icon: Home },
    H_brido: { label: "Híbrido", icon: Globe },
};

const vinculoEmpregaticioMap: Record<string, string> = {
    Estagio: "Estágio",
    CLT_Tempo_Integral: "CLT - Tempo Integral",
    CLT_Meio_Periodo: "CLT - Meio Período",
    Trainee: "Trainee",
    Aprendiz: "Aprendiz",
    PJ: "PJ",
    Freelancer_Autonomo: "Freelancer / Autônomo",
    Temporario: "Temporário",
};

export function VacancyDetails({ vacancy, company, isActive, applicationCount, userType, isOwner }: VacancyDetailsProps) {
    const router = useRouter();
    const stickyCardRef = useRef<HTMLDivElement>(null);
    const [isStickyVisible, setIsStickyVisible] = useState(true);
    const [hasScroll, setHasScroll] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [modal, setModal] = useState<ModalConfig>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
        confirmText: '',
        variant: 'info'
    });

    const normalizedUserType = userType?.toUpperCase();
    const isCandidate = normalizedUserType === 'CANDIDATO';
    const isCompany = normalizedUserType === 'EMPRESA';
    const isGuest = !normalizedUserType;
    const workType = tipoLocalTrabalhoMap[vacancy.tipo_local_trabalho] || tipoLocalTrabalhoMap.Presencial;
    const WorkTypeIcon = workType.icon;

    let inclusivity = null;
    try {
        inclusivity = vacancy.opcao ? JSON.parse(vacancy.opcao) : null;
    } catch (e) {
        // Silently fail if JSON is invalid
    }

    const affirmativeGroups = [];
    if (inclusivity?.women) affirmativeGroups.push("Mulheres");
    if (inclusivity?.blackPeople) affirmativeGroups.push("Pessoas Negras");
    if (inclusivity?.pcd) affirmativeGroups.push("PcD");
    if (inclusivity?.lgbt) affirmativeGroups.push("LGBTQIAPN+");

    // Preferir localização da vaga, fallback para localização da empresa
    const displayLocation = {
        cidade: inclusivity?.cidade || company?.cidade,
        estado: inclusivity?.estado || company?.estado,
        pais: inclusivity?.pais || company?.pais
    };

    // Detectar se a página tem scroll
    useEffect(() => {
        const checkScroll = () => {
            setHasScroll(document.documentElement.scrollHeight > window.innerHeight);
        };

        checkScroll();
        window.addEventListener('resize', checkScroll);

        return () => window.removeEventListener('resize', checkScroll);
    }, [vacancy]);

    // Intersection Observer para detectar visibilidade do card sticky
    useEffect(() => {
        if (!stickyCardRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsStickyVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        observer.observe(stickyCardRef.current);

        return () => observer.disconnect();
    }, []);

    const formatSalary = (salario: any, moeda: string | null | undefined) => {
        if (!salario) return null;
        const value = typeof salario === 'object' ? parseFloat(salario.toString()) : salario;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: moeda || 'BRL'
        }).format(value);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleViewFile = (file: any) => {
        const url = file.url;
        const name = file.nome || 'Arquivo';

        if (!url) return;

        let finalUrl = url;
        let typeParam = '';

        const mime = (file.mime || '').toLowerCase();
        const lowerName = name.toLowerCase();
        const lowerUrl = url.toLowerCase();

        const isPdf = mime.includes('pdf') ||
            lowerUrl.includes('.pdf') ||
            lowerUrl.includes('/pdf') ||
            lowerName.endsWith('.pdf');

        const isCloudinary = url.includes('cloudinary.com');

        if (isPdf) {
            if (isCloudinary) {
                finalUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
            }
            typeParam = '&type=application/pdf';
        }

        window.open(`/viewer?url=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(name)}${typeParam}`, '_blank');
    };

    const handleCopyLink = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar link:', err);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        const config = {
            'Ativa': {
                title: 'Reabrir Vaga',
                description: <>Deseja reabrir a vaga <strong>{vacancy.cargo}</strong>? Ela voltará a ficar visível para todos os candidatos.</>,
                confirmText: 'Reabrir Vaga',
                variant: 'success' as const
            },
            'Fechada': {
                title: 'Trancar Vaga',
                description: <>Deseja trancar a vaga <strong>{vacancy.cargo}</strong>? Ela deixará de aparecer na busca pública e novos candidatos não poderão se inscrever.</>,
                confirmText: 'Trancar Vaga',
                variant: 'warning' as const
            },
        }[newStatus] || {
            title: 'Confirmar Ação',
            description: `Deseja alterar o status para ${newStatus}?`,
            confirmText: 'Confirmar',
            variant: 'info' as const
        };

        setModal({
            isOpen: true,
            ...config,
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/vacancies/${vacancy.id}/status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ situacao: newStatus })
                    });

                    if (res.ok) {
                        router.refresh();
                        setModal(prev => ({ ...prev, isOpen: false }));
                    } else {
                        alert("Erro ao atualizar status.");
                    }
                } catch (e) {
                    console.error(e);
                    alert("Erro de conexão.");
                }
            }
        });
    };

    const handleRankCandidates = () => {
        startTransition(() => {
            selectVacancyForRanking(vacancy.id);
        });
    };

    const handleEditVacancy = () => {
        startTransition(() => {
            selectVacancyForEditing(vacancy.id);
        });
    };

    const handleDeleteVacancy = () => {
        setModal({
            isOpen: true,
            title: 'Excluir Vaga',
            description: <>Tem certeza que deseja excluir a vaga <strong>{vacancy.cargo}</strong> permanentemente? Esta ação não pode ser desfeita e todos os dados relacionados (candidatos, avaliações, etc) serão removidos.</>,
            confirmText: 'Excluir Definitivamente',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/vacancies/${vacancy.id}`, {
                        method: 'DELETE',
                    });

                    if (res.ok) {
                        router.push('/company/vacancies');
                        router.refresh();
                    } else {
                        const data = await res.json();
                        alert(data.error || "Erro ao excluir vaga.");
                    }
                } catch (e) {
                    console.error(e);
                    alert("Erro de conexão.");
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header simplificado */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>

                    <div className="flex items-start gap-4 mb-6">
                        {/* Logo da empresa */}
                        {company?.foto_perfil ? (
                            <img
                                src={company.foto_perfil}
                                alt={company.nome_empresa}
                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                <Building2 size={28} className="text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {vacancy.cargo}
                                    </h1>
                                    <p className="text-lg text-gray-600 mt-1">
                                        {company?.nome_empresa}
                                    </p>
                                    {affirmativeGroups.length > 0 && (
                                        <p className="text-sm text-purple-600 font-medium mt-1.5 flex items-center gap-1.5">
                                            <HeartHandshake size={14} />
                                            Vaga afirmativa p/ {affirmativeGroups.join(", ")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-2 hover:bg-gray-100 rounded-lg tr ansition-colors border border-gray-200 cursor-pointer group relative"
                                        title="Copiar link da vaga"
                                    >
                                        {linkCopied ? (
                                            <Check size={18} className="text-green-600" />
                                        ) : (
                                            <Copy size={18} className="text-gray-600 group-hover:text-gray-900" />
                                        )}
                                    </button>
                                    {isActive && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                            Vaga Ativa
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Informações principais */}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <WorkTypeIcon size={16} className="text-gray-400" />
                                    <span>{workType.label}</span>
                                </div>
                                {displayLocation.cidade && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{displayLocation.cidade}, {displayLocation.estado}</span>
                                    </div>
                                )}
                                {vacancy.salario && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-900">
                                            {formatSalary(vacancy.salario, vacancy.moeda)}
                                        </span>
                                    </div>
                                )}
                                {isOwner && (
                                    <div className="flex items-center gap-1.5">
                                        <Users size={16} className="text-gray-400" />
                                        <span>{applicationCount} candidatos</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna principal */}
                    <div className="lg:col-span-2 space-y-6">


                        {/* Descrição da vaga */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição da Vaga</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {vacancy.descricao}
                            </p>
                        </div>

                        {/* Benefícios */}
                        {vacancy.beneficio && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefícios</h2>
                                <div className="space-y-2">
                                    {vacancy.beneficio.split('\n').filter(b => b.trim()).map((benefit, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{benefit.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Áreas de Interesse (Hard Skills) */}
                        {vacancy.vaga_area && vacancy.vaga_area.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Atuação</h2>
                                <div className="flex flex-wrap gap-2">
                                    {vacancy.vaga_area.map((area) => (
                                        <span
                                            key={area.area_interesse.id}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium border border-gray-200"
                                        >
                                            {area.area_interesse.nome}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}



                        {/* Anexos e Links */}
                        {((vacancy.vaga_arquivo && vacancy.vaga_arquivo.length > 0) ||
                            (vacancy.vaga_link && vacancy.vaga_link.length > 0)) && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Materiais e Links</h2>

                                    {/* Arquivos */}
                                    {vacancy.vaga_arquivo && vacancy.vaga_arquivo.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-500 mb-3">Arquivos</h3>
                                            <div className="space-y-2">
                                                {vacancy.vaga_arquivo.map((file) => (
                                                    <button
                                                        key={file.id}
                                                        onClick={() => handleViewFile(file)}
                                                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:border-blue-100 transition-colors">
                                                                <FileText size={18} className="text-blue-500" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{file.nome}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold">{formatFileSize(file.tamanho)}</p>
                                                            </div>
                                                        </div>
                                                        <Eye size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Links */}
                                    {vacancy.vaga_link && vacancy.vaga_link.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-3">Links</h3>
                                            <div className="space-y-2">
                                                {vacancy.vaga_link.map((link) => (
                                                    <a
                                                        key={link.id}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <LinkIcon size={18} className="text-gray-400" />
                                                            <p className="text-sm font-medium text-gray-900">{link.titulo}</p>
                                                        </div>
                                                        <ExternalLink size={16} className="text-gray-400" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Sobre a empresa */}
                        {company && (
                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">Sobre a Empresa</h3>
                                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                    {company.descricao}
                                </p>
                                {displayLocation.cidade && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span>{displayLocation.cidade}, {displayLocation.estado}, {displayLocation.pais}</span>
                                    </div>
                                )}
                                <Link
                                    href="#"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                >
                                    <Building2 size={16} />
                                    Ver Perfil Público
                                </Link>
                            </div>
                        )}
                        {/* Informações da vaga */}
                        <div ref={stickyCardRef} className="bg-white rounded-lg border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>

                            <div className="space-y-4 text-sm">
                                {/* Publicação */}
                                <div className="flex items-start gap-3">
                                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Publicada em</p>
                                        <p className="text-gray-900 font-medium">
                                            {new Date(vacancy.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Vínculo */}
                                {vacancy.vinculo_empregaticio && (
                                    <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                                        <Briefcase size={16} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Vínculo</p>
                                            <p className="text-gray-900 font-medium">
                                                {vinculoEmpregaticioMap[vacancy.vinculo_empregaticio] || vacancy.vinculo_empregaticio}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Escala de trabalho */}
                                <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                                    <Clock size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Escala</p>
                                        <p className="text-gray-900 font-medium">
                                            {vacancy.escala_trabalho}
                                        </p>
                                    </div>
                                </div>

                                {/* Dias de trabalho (se híbrido) */}
                                {vacancy.tipo_local_trabalho === 'H_brido' && (
                                    <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                                        <Globe size={16} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-gray-500 text-xs mb-1">Distribuição</p>
                                            <p className="text-gray-900 font-medium text-xs">
                                                {vacancy.dias_presenciais || 0}x presencial • {vacancy.dias_home_office || 0}x remoto
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button or Management Actions */}
                            {!isOwner && isActive && (isCandidate || isGuest) && (
                                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer">
                                    Candidatar-se
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Seção de Gerenciamento para o Dono da Vaga */}
                {isOwner && (
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciamento de vagas</h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                {/* Lado Esquerdo */}
                                <div>
                                    <button
                                        onClick={handleRankCandidates}
                                        disabled={isPending}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50 text-sm"
                                    >
                                        <BarChart3 size={18} />
                                        Ver ranqueamento
                                    </button>
                                </div>

                                {/* Lado Direito */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleEditVacancy}
                                        disabled={isPending}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 text-sm"
                                    >
                                        <Edit size={18} />
                                        Editar vaga
                                    </button>

                                    {!isActive ? (
                                        <button
                                            onClick={() => handleUpdateStatus('Ativa')}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                                        >
                                            <Unlock size={18} />
                                            Abrir vaga
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateStatus('Fechada')}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                                        >
                                            <Ban size={18} />
                                            Fechar vaga
                                        </button>
                                    )}

                                    <button
                                        onClick={handleDeleteVacancy}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer text-sm"
                                    >
                                        <Trash2 size={18} />
                                        Excluir vaga
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {modal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                        />

                        {/* Modal Card */}
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fade-in duration-300 scale-100">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl shrink-0 ${modal.variant === 'danger' ? 'bg-red-50 text-red-600' :
                                        modal.variant === 'warning' ? 'bg-amber-50 text-amber-600' :
                                            modal.variant === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-blue-50 text-blue-600'
                                        }`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                                            {modal.title}
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            {modal.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={modal.onConfirm}
                                        className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-opacity-20 cursor-pointer ${modal.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' :
                                            modal.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
                                                modal.variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' :
                                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                            }`}
                                    >
                                        {modal.confirmText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Button no final da página */}
                {!isOwner && isActive && hasScroll && !isStickyVisible && (isCandidate || isGuest) && (
                    <div className="mt-10">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Interessado nesta vaga?</h3>
                                    <p className="text-sm text-gray-600">Candidate-se agora e faça parte do time {company?.nome_empresa}!</p>
                                </div>
                                <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer">
                                    Candidatar-se à Vaga
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
