"use client";

import React, { useMemo } from 'react';
import { Rocket, Info, Camera, MapPin, Phone, Calendar, Target } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface ProfileCompletionProps {
    candidato: any; // Idealmente usar a Interface definida anteriormente
    usuario: any;
    areas: string[];
}

export function ProfileCompletion({ candidato, usuario, areas }: ProfileCompletionProps) {
    const { t } = useTranslation();
    // 1. Lógica de Resolução de Dados (Substitui os consts do seu EJS)
    const stats = useMemo(() => {
        const fotoUrl = candidato?.foto_perfil || usuario?.foto_perfil || '';
        const hasFoto = fotoUrl !== '' && fotoUrl !== '/img/avatar.png' && fotoUrl !== '/img/DEFAULT_AVATAR.png';

        const localidadeValida = (loc: any) => {
            if (!loc) return false;
            const texto = String(loc).trim().toLowerCase();
            // Verifica se existe conteúdo e se não é apenas o texto de placeholder
            return texto !== "" &&
                texto !== "localidade não informada" &&
                texto !== "undefined" &&
                texto !== "null";
        };

        const hasLocal = localidadeValida(candidato?.cidade) ||
            localidadeValida(candidato?.estado) ||
            localidadeValida(candidato?.pais);


        const hasTel = !!(candidato?.telefone || (candidato?.ddd && candidato?.numero));
        const hasNasc = !!(candidato?.data_nascimento || usuario?.data_nascimento);
        const hasAreas = Array.isArray(areas) && areas.length >= 1;

        // Checklist para cálculo
        const checklist = [
            { label: t("add_photo"), done: hasFoto, icon: <Camera size={14} />, link: '/candidate/edit/profile' },
            { label: t("define_location"), done: hasLocal, icon: <MapPin size={14} />, link: '/candidate/edit/profile' },
            { label: t("add_phone"), done: hasTel, icon: <Phone size={14} />, link: '/candidate/edit/profile' },
            { label: t("birth_date"), done: hasNasc, icon: <Calendar size={14} />, link: '/candidate/edit/profile' },
            { label: t("select_areas"), done: hasAreas, icon: <Target size={14} />, link: '/candidate/edit/profile' },
        ];

        const totalSteps = checklist.length;
        const doneSteps = checklist.filter(item => item.done).length;
        const completion = Math.round((doneSteps / totalSteps) * 100);

        return { completion, checklist };
    }, [candidato, usuario, areas, t]);

    // Se o perfil estiver 100% completo, não renderiza nada (conforme seu EJS)
    if (stats.completion >= 100) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            {/* Cabeçalho do Progresso */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                    <Rocket className="text-blue-600" size={20} />
                    <span className="text-sm md:text-base">{t("dashboard_profile_completion_cta")}</span>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {stats.completion}%
                </span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${stats.completion}%` }}
                ></div>
            </div>

            {/* Info extra */}
            <div className="flex items-center gap-1.5 text-gray-400 mb-4">
                <Info size={14} />
                <p className="text-[12px]">{t("dashboard_profile_hint")}</p>
            </div>

            {/* Botões de Ação (Apenas o que falta fazer) */}
            <div className="flex flex-wrap gap-2">
                {stats.checklist.filter(item => !item.done).map((item, index) => (
                    <a
                        key={index}
                        href={item.link}
                        className="flex items-center gap-2 px-3 py-1.5 border border-blue-200 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors"
                    >
                        {item.icon}
                        {item.label}
                    </a>
                ))}
            </div>
        </div>
    );
}