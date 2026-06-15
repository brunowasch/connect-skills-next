"use client";

import React, { useMemo } from 'react';
import { Rocket, Info, Camera, BookOpen, Target, Calendar } from 'lucide-react';
import { useTranslation } from "react-i18next";
import Link from 'next/link';

interface MentorProfileCompletionProps {
    mentor: {
        foto_perfil?: string | null;
        bio?: string | null;
        specialties: string[];
        availabilityCount: number;
    };
}

export function MentorProfileCompletion({ mentor }: MentorProfileCompletionProps) {
    const { t } = useTranslation();

    const stats = useMemo(() => {
        const fotoUrl = mentor?.foto_perfil || '';
        const hasFoto = fotoUrl !== '' && fotoUrl !== '/img/avatar.png' && fotoUrl !== '/img/DEFAULT_AVATAR.png';

        const hasBio = !!mentor?.bio && mentor.bio.trim().length > 10;
        const hasSpecialties = Array.isArray(mentor?.specialties) && mentor.specialties.length >= 1;
        const hasAvailability = mentor?.availabilityCount > 0;

        const checklist = [
            {
                label: t("add_photo", "Adicionar foto de perfil"),
                done: hasFoto,
                icon: <Camera size={14} />,
                link: '/mentor/register'
            },
            {
                label: t("write_bio", "Escrever sua bio"),
                done: hasBio,
                icon: <BookOpen size={14} />,
                link: '/mentor/register'
            },
            {
                label: t("select_specialties", "Selecionar especialidades"),
                done: hasSpecialties,
                icon: <Target size={14} />,
                link: '/mentor/specialties'
            },
            {
                label: t("config_availability", "Configurar disponibilidade"),
                done: hasAvailability,
                icon: <Calendar size={14} />,
                link: '/mentor/availability'
            },
        ];

        const totalSteps = checklist.length;
        const doneSteps = checklist.filter(item => item.done).length;
        const completion = Math.round((doneSteps / totalSteps) * 100);

        return { completion, checklist };
    }, [mentor, t]);

    if (stats.completion >= 100) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Rocket className="text-blue-600" size={20} />
                    <span className="text-sm md:text-base">{t("mentor_profile_completion_cta", "Complete seu perfil de mentor")}</span>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {stats.completion}%
                </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${stats.completion}%` }}
                ></div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 mb-4">
                <Info size={14} />
                <p className="text-[12px]">{t("mentor_profile_hint", "Perfis completos aparecem primeiro para os candidatos.")}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {stats.checklist.filter(item => !item.done).map((item, index) => (
                    <Link
                        key={index}
                        href={item.link}
                        className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors"
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
