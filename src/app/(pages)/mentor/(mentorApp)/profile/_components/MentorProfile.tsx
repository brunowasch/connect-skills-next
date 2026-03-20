"use client";

import { useState } from 'react';
import {
    MapPin, Phone, User, PencilLine,
    Link as LinkIcon, ExternalLink, Copy, Check, Target, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { AreasList } from "@/src/app/_components/Shared/AreasList";

interface MentorProfileProps {
    mentor: any;
    fotoPerfil?: string;
    localidade: string | null;
    contato: { ddi?: string; ddd?: string; numero?: string };
    perfilShareUrl: string;
}

export function MentorProfile({ mentor, fotoPerfil, localidade, contato, perfilShareUrl }: MentorProfileProps) {
    const { t } = useTranslation();
    const [copiado, setCopiado] = useState(false);

    const handleCopyLink = () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const fullUrl = perfilShareUrl.startsWith('http') ? perfilShareUrl : `${origin}${perfilShareUrl}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <div className="w-full font-outfit">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("mentor_profile_title", "Meu Perfil")}</h1>
                <p className="text-gray-500">
                    {t("mentor_profile_subtitle", "Visualize como os candidatos veem seu perfil profissional.")}
                </p>
            </div>

            <section className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-100 pb-8">
                    <div className="relative">
                        {fotoPerfil ? (
                            <img
                                src={fotoPerfil}
                                alt={t("profile_photo_alt")}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-200"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md ring-1 ring-slate-200 flex items-center justify-center">
                                <User size={64} className="text-slate-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {mentor.nome || t("user_default_name")} {mentor.sobrenome || ''}
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500" /> {localidade || t("location_not_informed")}</span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone size={16} className="text-blue-500" />
                                        {contato.ddi || contato.ddd || contato.numero ? (
                                            `${contato.ddi ? `+${contato.ddi} ` : ''}${contato.ddd ? `(${contato.ddd}) ` : ''}${contato.numero}`
                                        ) : t('not_informed')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link href="/mentor/profile/edit">
                                    <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer">
                                        <PencilLine size={16} /> {t("edit_profile_btn")}
                                    </button>
                                </Link>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                                >
                                    {copiado ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} className="text-slate-400" />}
                                    {copiado ? t("link_copied") : t("copy_link_btn", "Compartilhar")}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <User size={14} /> {t("about_me", "Sobre Mim")}
                            </h3>
                            <p className="text-slate-700 leading-relaxed italic text-sm sm:text-base">
                                {mentor.bio || t("no_description", "Nenhuma descrição informada.")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Target className="text-blue-600" size={18} /> {t("mentor_specialties_title", "Especialidades")}
                            </h3>
                            <Link href="/mentor/edit/area">
                                <button className="text-blue-600 text-sm font-bold cursor-pointer hover:underline">{t("edit_areas", "Alterar")}</button>
                            </Link>
                        </div>
                        <AreasList areas={mentor.mentor_area} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="text-blue-600" size={18} /> {t("mentor_availability_title", "Agenda de Mentorias")}
                            </h3>
                            <Link href="/mentor/availability">
                                <button className="text-blue-600 text-sm font-bold cursor-pointer hover:underline">{t("edit_schedule", "Gerenciar Agenda")}</button>
                            </Link>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                            <p className="text-slate-600 text-sm mb-4">
                                {t("availability_summary", "Você possui horários configurados para sessões de mentoria.")}
                            </p>
                            <Link href="/mentor/availability" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all">
                                {t("view_full_schedule", "Ver agenda completa")} <ExternalLink size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
