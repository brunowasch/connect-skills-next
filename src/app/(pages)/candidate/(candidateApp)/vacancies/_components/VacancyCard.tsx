"use client";

import { Vacancy } from '@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy';
import { MapPin, Briefcase, HeartHandshake, Building2, Star } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '../_hooks/useFavorites';

const tipoMap = {
    Presencial: 'Presencial',
    Home_Office: 'Home Office',
    H_brido: 'Híbrido',
};

const vinculoMap: Record<string, string> = {
    Estagio: 'Estágio',
    CLT_Tempo_Integral: 'CLT (integral)',
    PJ: 'PJ',
    CLT_Meio_Periodo: 'CLT (meio período)',
    Trainee: 'Trainee',
    Aprendiz: 'Aprendiz',
    Freelancer_Autonomo: 'Freelancer (autônomo)',
    Temporario: 'Temporário',
};

const DEFAULT_AVATAR = <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500" />;

export function VacancyCard({ vaga }: { vaga: Vacancy }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(vaga.id);

    let inclusivity = null;
    try {
        inclusivity = vaga.opcao ? JSON.parse(vaga.opcao) : null;
    } catch (e) { }

    const affirmativeGroups = [];
    if (inclusivity?.women) affirmativeGroups.push("Mulheres");
    if (inclusivity?.blackPeople) affirmativeGroups.push("Pessoas Negras");
    if (inclusivity?.pcd) affirmativeGroups.push("PcD");
    if (inclusivity?.lgbt) affirmativeGroups.push("LGBTQIAPN+");

    const displayCidade = inclusivity?.cidade || vaga.empresa?.cidade;
    const displayEstado = inclusivity?.estado || vaga.empresa?.estado;

    return (
        <Link
            href={`/viewer/vacancy/${vaga.uuid}`}
            className={`group bg-white rounded-xl shadow-sm border ${vaga.isNear ? 'border-blue-300 ring-2 ring-blue-500/5' : 'border-gray-100'} 
                hover:shadow-md transition-all hover:border-blue-400 
                flex flex-col h-full block relative`}
        >
            {vaga.isNear && (
                <div className="absolute -top-2 -right-2 z-10">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 animate-pulse">
                        <MapPin size={10} />
                        PRÓXIMO A VOCÊ
                    </span>
                </div>
            )}
            <div className="p-5 flex-grow">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {vaga.empresa?.foto_perfil ? (
                            <Image
                                src={vaga.empresa.foto_perfil}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                alt="Logo"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center bg-gray-50">
                                {DEFAULT_AVATAR}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-600 truncate max-w-[120px]">
                            {vaga.empresa?.nome_empresa}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(vaga.id);
                        }}
                        className={`p-2 rounded-full transition-all hover:bg-gray-100 group/star ${favorited ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                        <Star
                            size={20}
                            fill={favorited ? "currentColor" : "none"}
                            className={`transition-transform group-active/star:scale-125 cursor-pointer ${favorited ? 'filter drop-shadow-sm' : ''}`}
                        />
                    </button>
                </div>

                <h3 className="font-bold text-slate-900 
                transition-colors 
                truncate 
                group-hover:text-blue-600 mb-3">
                    {vaga.cargo}
                </h3>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500 gap-0.5">
                        <MapPin className="text-slate-400 relative top-[-1px]" size={15} />
                        <span>{displayCidade}, {displayEstado} - {tipoMap[vaga.tipo_local_trabalho]}</span>
                        <span className="ml-auto flex items-center gap-1">

                        </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 gap-0.5">
                        <Briefcase className="text-slate-400 relative top-[-1px]" size={15} />
                        <span>{vinculoMap[vaga.vinculo_empregaticio || '']}</span>
                    </div>

                    {affirmativeGroups.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 font-medium gap-0.5 mt-1">
                            <HeartHandshake className="text-slate-400 relative top-[-1px]" size={15} />
                            <span>Vaga afirmativa p/ {affirmativeGroups.join(", ")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rodapé do Card (Data) */}
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 rounded-b-xl">
                <p className="text-[11px] text-gray-400">
                    Publicada em: {vaga.created_at ? new Date(vaga.created_at).toLocaleDateString('pt-BR') : '---'}
                </p>
            </div>
        </Link>
    );
}
