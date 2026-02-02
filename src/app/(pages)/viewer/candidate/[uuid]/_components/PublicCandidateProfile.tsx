"use client";

import {
    MapPin, Phone, Calendar, User,
    Link as LinkIcon, Paperclip, ExternalLink, FileText, ArrowLeft
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface PerfilProps {
    candidato: any;
    fotoPerfil?: string;
    localidade: string | null;
    contato: { ddi?: string; ddd?: string; numero?: string };
    links: { id?: string; label?: string; url: string; ordem?: number }[];
    anexos: { id: string; nome: string; url: string; mime: string; tamanho: number; criadoEm: string }[];
}

export function PublicCandidateProfile({ candidato, fotoPerfil, localidade, contato, links, anexos }: PerfilProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        setShowBackButton(window.history.length > 1);
    }, []);

    const handleBack = () => {
        router.back();
    };

    const handleViewFile = async (url: string, nome: string) => {
        if (!url) {
            alert(t('error_file_url_missing') || 'Erro: URL do arquivo não encontrada');
            return;
        }

        const lowerUrl = url.toLowerCase();
        const lowerName = nome?.toLowerCase() || '';
        const isPdf = lowerUrl.includes('.pdf') ||
            lowerUrl.includes('/pdf') ||
            lowerName.endsWith('.pdf');

        if (isPdf) {
            try {
                let finalUrl = url;
                if (url.includes('cloudinary.com')) {
                    finalUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                }
                const viewerUrl = `/viewer?url=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(nome)}&type=application/pdf`;
                window.open(viewerUrl, '_blank');
                return;
            } catch (error) {
                console.error("[handleViewFile] Erro ao abrir PDF:", error);
                alert(`Erro ao carregar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            }
        }

        const viewerUrl = `/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(nome)}`;
        window.open(viewerUrl, '_blank');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            title={t('back_btn')}
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t('public_profile_of')} {candidato.nome} {candidato.sobrenome}
                    </h1>
                </div>

                {/* Language Switcher */}
                <LanguageSwitcher align="right" />
            </div>

            <section className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                {/* HEADER DO PERFIL */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-100 pb-8">
                    <div className="relative">
                        {fotoPerfil ? (
                            <img
                                src={fotoPerfil}
                                alt={t("profile_photo_alt")}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-gray-200"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md ring-1 ring-gray-200 flex items-center justify-center">
                                <User size={64} className="text-slate-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {candidato.nome || t("user_default_name")} {candidato.sobrenome || ''}
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin size={16} className="text-blue-500" /> {localidade || t("location_not_informed")}</span>
                                    <span className="flex items-center gap-1">
                                        <Phone size={16} className="text-blue-500" />
                                        {contato.ddi || contato.ddd || contato.numero ? (
                                            `${contato.ddi ? `+${contato.ddi} ` : ''}${contato.ddd ? `(${contato.ddd}) ` : ''}${contato.numero}`
                                        ) : t('not_informed')}
                                    </span>
                                    {candidato.data_nascimento && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={16} className="text-blue-500" />
                                            {new Date(candidato.data_nascimento).toLocaleDateString(i18n.language, { timeZone: 'UTC' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <User size={14} /> {t("about_me")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed italic">
                                {candidato.descricao || t("no_description")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Target className="text-blue-600" size={18} /> {t("areas_of_interest")}
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {candidato.candidato_area?.length > 0 ? (
                                candidato.candidato_area.map((ca: any, idx: number) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-medium">
                                        {t(ca.area_interesse?.nome) || t("area_default")}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm italic">{t("no_areas_selected")}</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LinkIcon className="text-blue-600" size={18} /> {t("links_network")}
                        </h3>
                        <div className="flex flex-col gap-2">
                            {links.length > 0 ? links.map((link, idx) => (
                                <a
                                    key={idx}
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
                                            {link.label || t("access_link")}
                                        </span>
                                    </div>
                                    <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            )) : <p className="text-gray-400 text-sm">{t("no_links")}</p>}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Paperclip className="text-blue-600" size={18} /> {t("attachments")}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {anexos.length > 0 ? anexos.map((a, idx) => {
                                const isImage = a.mime?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.url);
                                const isPdf = a.mime?.includes('pdf') || /\.pdf$/i.test(a.url);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleViewFile(a.url, a.nome)}
                                        className="group relative flex flex-col w-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all text-left h-48 cursor-pointer"
                                    >
                                        <div className="flex-grow w-full bg-gray-50 relative flex items-center justify-center overflow-hidden">
                                            {isImage ? (
                                                <img
                                                    src={a.url}
                                                    alt={a.nome}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-colors ${isPdf ? 'bg-red-50/50 group-hover:bg-red-50' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                    <div className={`p-3 rounded-xl shadow-sm ${isPdf ? 'bg-white text-red-500' : 'bg-white text-blue-500'}`}>
                                                        {isPdf ? <FileText size={32} /> : <Paperclip size={32} />}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                                        {a.mime?.split('/')[1] || 'FILE'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="bg-white/90 p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                    <ExternalLink size={20} className="text-blue-600" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 border-t border-gray-100 bg-white relative z-10">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate" title={a.nome}>{a.nome}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{formatSize(a.tamanho)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">{t("no_attachments")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const Target = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
