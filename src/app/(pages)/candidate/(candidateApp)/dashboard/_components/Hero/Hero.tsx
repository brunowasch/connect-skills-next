import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User, PencilLine } from 'lucide-react';
import { HeroProps } from '@/src/app/(pages)/candidate/(candidateApp)/types/HeroProps';

const DEFAULT_AVATAR = "/img/DEFAULT_AVATAR.png";

export function Hero({ candidato }: HeroProps) {
    const fotoUrl = candidato.foto_perfil || DEFAULT_AVATAR;
    const localizacao = [candidato.cidade, candidato.estado, candidato.pais]
        .filter(Boolean)
        .join(", ") || "Localização não informada";
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-10 mb-4 sm:mb-6 border border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">

                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 overflow-hidden">
                        {fotoUrl && fotoUrl !== DEFAULT_AVATAR ? (
                            <Image
                                src={fotoUrl}
                                alt="Foto do perfil"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 m-0 truncate">
                            Olá, {candidato.nome} {candidato.sobrenome}!
                        </h1>
                        <div className="flex items-center text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
                            <MapPin size={12} className="mr-1 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                            <span className="truncate">{localizacao}</span>
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm md:text-base mt-1 hidden sm:block">
                            Bem-vindo ao seu painel do Connect Skills.
                        </p>
                    </div>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex flex-col sm:flex-row md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
                    <Link
                        href="/candidate/profile"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-xs sm:text-sm font-medium"
                    >
                        <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Meu perfil
                    </Link>

                    <Link
                        href="/candidate/profile/editProfile"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-xs sm:text-sm font-medium"
                    >
                        <PencilLine size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Editar perfil
                    </Link>
                </div>

            </div>
        </div>
    );
}