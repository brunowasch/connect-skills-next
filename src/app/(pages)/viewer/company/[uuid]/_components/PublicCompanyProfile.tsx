"use client";

import { Building2, MapPin, Phone, Mail, FileText, ExternalLink, ArrowLeft, Briefcase, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

interface CompanyProfileProps {
    company: {
        id: string;
        nome_empresa: string | null;
        foto_perfil: string | null;
        descricao: string | null;
    };
    fotoPerfil?: string;
    localidade: string;
    contato: {
        ddi: string;
        ddd: string;
        numero: string;
    };
    email?: string;
    anexos?: {
        id: string;
        nome: string;
        url: string;
        mime: string;
        tamanho: number;
    }[];
    links?: {
        id: string;
        label: string;
        url: string;
        ordem: number;
    }[];
    vagas?: {
        id: string;
        uuid: string;
        cargo: string;
        tipo_local_trabalho: string;
        vinculo_empregaticio: string;
        created_at: string;
        tags: string[];
    }[];
}

export function PublicCompanyProfile({ company, fotoPerfil, localidade, contato, email, anexos, links, vagas }: CompanyProfileProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                if (referrerUrl.host === window.location.host) {
                    setShowBackButton(true);
                }
            } catch (e) {
                // Invalid URL
            }
        }
    }, []);




    const telefoneCompleto = contato.ddi
        ? `+${contato.ddi} (${contato.ddd}) ${contato.numero}`
        : contato.ddd
            ? `(${contato.ddd}) ${contato.numero}`
            : contato.numero;

    const handleViewFile = async (anexo: any) => {
        const url = anexo.url;
        const nome = anexo.nome || t('vacancy_file_name_default');

        if (!url) {
            console.error('[handleViewFile] URL vazia!');
            alert(t('file_url_not_found_error') || "URL não encontrada");
            return;
        }

        const mime = anexo.mime || '';
        const isPdf = mime.includes('pdf') || url.toLowerCase().includes('.pdf');

        if (isPdf) {
            try {
                const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                const viewerUrl = `/viewer?url=${encodeURIComponent(proxyUrl)}&title=${encodeURIComponent(nome)}&type=application/pdf`;
                window.open(viewerUrl, '_blank');
                return;
            } catch (error) {
                console.error("[handleViewFile] Erro ao abrir PDF:", error);
                alert(`${t('pdf_load_error')}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            }
        }

        const mimeType = anexo.mime || '';
        const viewerUrl = `/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(nome)}&type=${encodeURIComponent(mimeType)}`;
        window.open(viewerUrl, '_blank');
    };

    return (
        <div className="h-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined' && window.history.length > 1) {
                                    router.back();
                                } else {
                                    window.close();
                                }
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            title={t('back_btn')}
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t('public_profile_of')} {company.nome_empresa}
                    </h1>
                </div>

                {/* Language Switcher */}
                <LanguageSwitcher align="right" />
            </div>

            {/* Header Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-md">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Company Logo */}
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white shadow-xl flex-shrink-0 border-4 border-white">
                        {fotoPerfil ? (
                            <Image
                                src={fotoPerfil}
                                alt={company.nome_empresa || t('default_company_name') || "Empresa"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                <Building2 size={48} className="text-slate-500" />
                            </div>
                        )}
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                            {company.nome_empresa || t('default_company_name') || "Nome da Empresa"}
                        </h2>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-blue-100">
                                <MapPin size={16} className="text-blue-600" />
                                <span>{localidade}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* Left Column - About */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-blue-600" />
                            {t('about_company')}
                        </h3>
                        {company.descricao ? (
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {company.descricao}
                            </p>
                        ) : (
                            <p className="text-gray-400 italic">
                                {t('no_description')}
                            </p>
                        )}
                    </div>

                    {/* Files Section */}
                    {anexos && anexos.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" />
                                {t('docs_and_attachments')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {anexos.map((arquivo, idx) => {
                                    const isImage = arquivo.mime?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(arquivo.url);
                                    const isPdf = arquivo.mime?.includes('pdf') || /\.pdf$/i.test(arquivo.url);

                                    return (
                                        <button
                                            key={arquivo.id || idx}
                                            onClick={() => handleViewFile(arquivo)}
                                            className="group relative flex flex-col w-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all text-left h-48"
                                        >
                                            {/* Preview Area */}
                                            <div className="flex-grow w-full bg-gray-50 relative flex items-center justify-center overflow-hidden">
                                                {isImage ? (
                                                    <img
                                                        src={arquivo.url}
                                                        alt={arquivo.nome}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-colors ${isPdf ? 'bg-red-50/50 group-hover:bg-red-50' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                        <div className={`p-3 rounded-xl shadow-sm ${isPdf ? 'bg-white text-red-500' : 'bg-white text-blue-500'}`}>
                                                            {isPdf ? <FileText size={32} /> : <FileText size={32} />}
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                                            {arquivo.mime?.split('/')[1] || 'FILE'}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="bg-white/90 p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                        <ExternalLink size={20} className="text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="p-3 border-t border-gray-100 bg-white relative z-10 w-full">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 w-full">
                                                        <p className="text-sm font-semibold text-gray-800 truncate block w-full" title={arquivo.nome}>{arquivo.nome}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{(arquivo.tamanho / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Contact & Details */}
                <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('contact')}</h3>
                        <div className="space-y-4">
                            {email && (
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide font-semibold">{t('email')}</p>
                                        <a
                                            href={`mailto:${email}`}
                                            className="text-sm text-gray-900 hover:text-blue-600 transition-colors break-all block truncate"
                                            title={email}
                                        >
                                            {email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {telefoneCompleto && telefoneCompleto !== '' && (
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide font-semibold">{t('phone')}</p>
                                        <a
                                            href={`tel:${telefoneCompleto}`}
                                            className="text-sm text-gray-900 hover:text-green-600 transition-colors"
                                        >
                                            {telefoneCompleto}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Links */}
                    {links && links.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <ExternalLink size={20} className="text-blue-600" />
                                {t('links_and_socials')}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {links.map((link) => (
                                    <a
                                        key={link.id}
                                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 rounded-lg bg-white shadow-sm ring-1 ring-gray-100 group-hover:ring-blue-100 group-hover:bg-blue-50 transition-all">
                                                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-sm font-semibold truncate">
                                                {link.label || t('visit_link')}
                                            </span>
                                        </div>
                                        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Vacancies Section */}
            {vagas && vagas.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow mt-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600" />
                        {t('open_vacancies_title')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vagas.map((vaga) => (
                            <Link
                                key={vaga.id}
                                href={`/viewer/vacancy/${vaga.uuid}`}
                                className="group block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-lg transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {vaga.cargo}
                                    </h4>
                                    {vaga.tipo_local_trabalho && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                                            {t(vaga.tipo_local_trabalho || 'N/A')}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Briefcase size={12} />
                                        {t(vaga.vinculo_empregaticio || 'N/A')}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(vaga.created_at).toLocaleDateString(i18n.language)}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {vaga.tags.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                            {tag}
                                        </span>
                                    ))}
                                    {vaga.tags.length > 3 && (
                                        <span className="text-[10px] text-gray-400 px-1">+{vaga.tags.length - 3}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
