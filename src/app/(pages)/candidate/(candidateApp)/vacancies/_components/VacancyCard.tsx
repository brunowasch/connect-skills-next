"use client";

import { Vacancy } from '@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy';
import { MapPin, Briefcase, HeartHandshake, Building2, Star, CheckCircle, XCircle, Camera, Check } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '../_hooks/useFavorites';
import { useTranslation } from "react-i18next";

const DEFAULT_AVATAR = <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500" />;

export function VacancyCard({ vaga }: { vaga: Vacancy }) {
    const { t } = useTranslation();
    const { isFavorite, toggleFavorite, isInitialized } = useFavorites();

    const tipoMap: Record<string, string> = {
        Presencial: t("Presencial"),
        Home_Office: t("Home Office"),
        H_brido: t("Híbrido"),
    };

    const vinculoMap: Record<string, string> = {
        Estagio: t("Estágio"),
        CLT_Tempo_Integral: t("CLT - Tempo Integral"),
        PJ: t("PJ"),
        CLT_Meio_Periodo: t("CLT - Meio Período"),
        Trainee: t("Trainee"),
        Aprendiz: t("Aprendiz"),
        Freelancer_Autonomo: t("Freelancer / Autônomo"),
        Temporario: t("Temporário"),
        '': t("not_defined")
    };

    const favorited = isInitialized ? isFavorite(vaga.id) : !!vaga.isFavorited;

    let inclusivity = null;
    try {
        inclusivity = vaga.opcao ? JSON.parse(vaga.opcao) : null;
    } catch (e) { }

    const affirmativeGroups = [];
    if (inclusivity?.women) affirmativeGroups.push(t("Women"));
    if (inclusivity?.blackPeople) affirmativeGroups.push(t("BlackPeople"));
    if (inclusivity?.pcd) affirmativeGroups.push(t("PcD"));
    if (inclusivity?.lgbt) affirmativeGroups.push(t("LGBT"));

    const displayCidade = inclusivity?.cidade || vaga.empresa?.cidade;
    const displayEstado = inclusivity?.estado || vaga.empresa?.estado;

    const isRejected = vaga.feedbackStatus === 'REJECTED';

    return (
        <Link
            href={`/viewer/vacancy/${vaga.uuid}`}
            className={`group bg-white rounded-xl shadow-sm border 
                ${vaga.isNear ? 'border-blue-300 ring-2 ring-blue-500/5' : 'border-gray-100'} 
                ${isRejected ? 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0' : 'hover:shadow-md hover:border-blue-400'}
                transition-all active:scale-[0.98]
                flex flex-col h-full block relative min-w-0 overflow-hidden`}
        >
            {vaga.isNear && (
                <div className="absolute top-2 right-2 z-10 mb-">
                    <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm flex items-center gap-0.5 sm:gap-1 animate-pulse">
                        <MapPin size={10} />
                        {t("next_to_you")}
                    </span>
                </div>
            )}
            
            <div className="p-3 sm:p-5 flex-grow">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        {vaga.empresa?.foto_perfil ? (
                            <Image
                                src={vaga.empresa.foto_perfil}
                                width={40}
                                height={40}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-gray-100 ${isRejected ? 'grayscale' : ''}`}
                                alt="Logo"
                            />
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-100 flex items-center justify-center bg-gray-50">
                                {DEFAULT_AVATAR}
                            </div>
                        )}
                        <span className="text-xs sm:text-sm font-medium text-gray-600 truncate max-w-[100px] sm:max-w-[120px]">
                            {vaga.empresa?.nome_empresa}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(vaga.id);
                        }}
                        className={`p-2 rounded-full transition-all mt-4 hover:bg-gray-100 active:bg-gray-200 group/star ${favorited ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                        <Star
                            size={18}
                            fill={favorited ? "currentColor" : "none"}
                            className={`transition-transform group-active/star:scale-125 cursor-pointer sm:w-5 sm:h-5 ${favorited ? 'filter drop-shadow-sm' : ''}`}
                        />
                    </button>
                </div>

                <h3 className={`font-bold text-sm sm:text-base transition-colors line-clamp-2 mb-1 sm:mb-2 
                    ${vaga.feedbackStatus === 'APPROVED' ? 'text-emerald-600' :
                        vaga.feedbackStatus === 'REJECTED' ? 'text-red-600' :
                            'text-slate-900 group-hover:text-blue-600'}`}>
                    {vaga.cargo}
                </h3>

                <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
                    <div className="flex items-center text-[11px] sm:text-xs text-gray-500 gap-1.5 min-w-0">
                        <MapPin className="text-slate-400 flex-shrink-0 w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
                        <span className="truncate">{displayCidade ? `${displayCidade}, ${displayEstado}` : t("location_not_informed")} - {tipoMap[vaga.tipo_local_trabalho]}</span>
                    </div>
                    <div className="flex items-center text-[11px] sm:text-xs text-gray-500 gap-1.5">
                        <Briefcase className="text-slate-400 flex-shrink-0 w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
                        <span>{vinculoMap[vaga.vinculo_empregaticio || '']}</span>
                    </div>

                    {/* Badges de Status (Aprovado/Reprovado/Vídeo) */}
                    {(vaga.feedbackStatus || vaga.videoStatus) && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {vaga.feedbackStatus === 'APPROVED' && (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] sm:text-[10px] font-bold text-emerald-600 shadow-sm">
                                    <CheckCircle size={10} className="mr-1" />
                                    {t("approved")}
                                </span>
                            )}
                            {vaga.feedbackStatus === 'REJECTED' && (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[9px] sm:text-[10px] font-bold text-red-600 shadow-sm">
                                    <XCircle size={10} className="mr-1" />
                                    {t("rejected")}
                                </span>
                            )}
                            {vaga.videoStatus === 'requested' && (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[9px] sm:text-[10px] font-bold text-purple-600 shadow-sm">
                                    <Camera size={10} className="mr-1" />
                                    {t("video_requested")}
                                </span>
                            )}
                            {vaga.videoStatus === 'submitted' && (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[9px] sm:text-[10px] font-bold text-green-600 shadow-sm">
                                    <Check size={10} className="mr-1" />
                                    {t("video_submitted")}
                                </span>
                            )}
                        </div>
                    )}

                    {affirmativeGroups.length > 0 && (
                        <div className="flex items-center text-[11px] sm:text-xs text-gray-500 font-medium gap-1.5 mt-1">
                            <HeartHandshake className="text-slate-400 flex-shrink-0 w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
                            <span>Vaga afirmativa p/ {affirmativeGroups.join(", ")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rodapé do Card (Data) */}
            <div className="px-3 sm:px-5 py-2 sm:py-3 border-t border-gray-50 bg-gray-50/30 rounded-b-xl flex justify-between items-center">
                <p className="text-[10px] sm:text-[11px] text-gray-400">
                    {t("vacancy_published_at")}: {vaga.created_at ? new Date(vaga.created_at).toLocaleDateString() : '---'}
                </p>
                {(vaga.score ?? 0) > 0 && (
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {vaga.score}% Match
                    </span>
                )}
            </div>
        </Link>
    );
}
