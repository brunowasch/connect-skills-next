"use client";

import { Vacancy } from '@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy';
import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Briefcase, HeartHandshake } from "lucide-react";

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

const DEFAULT_AVATAR = <User className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500" />;

export function VacancyCard({ vaga }: { vaga: Vacancy }) {
    let inclusivity = null;
    try {
        inclusivity = vaga.opcao ? JSON.parse(vaga.opcao) : null;
    } catch (e) {
        // Silently fail if JSON is invalid
    }

    const affirmativeGroups = [];
    if (inclusivity?.women) affirmativeGroups.push("Mulheres");
    if (inclusivity?.blackPeople) affirmativeGroups.push("Pessoas Negras");
    if (inclusivity?.pcd) affirmativeGroups.push("PcD");
    if (inclusivity?.lgbt) affirmativeGroups.push("LGBTQIAPN+");

    return (
        <Link
            href={`/viewer/vacancy/${vaga.uuid}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 
                hover:shadow-md transition-all hover:border-blue-200 
                flex flex-col h-full block"
        >
            <div className="p-5 flex-grow">
                <div className="flex items-center gap-3 mb-4">
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
                    <span className="text-sm font-medium text-gray-600 truncate">
                        {vaga.empresa?.nome_empresa}
                    </span>
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
                        <span>{vaga.empresa?.cidade}, {vaga.empresa?.estado} - {tipoMap[vaga.tipo_local_trabalho]}</span>
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
