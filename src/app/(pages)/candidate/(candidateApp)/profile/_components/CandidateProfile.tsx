"use client";

import { useState } from 'react';
import {
    MapPin, Phone, Calendar, User, PencilLine,
    Link as LinkIcon, Paperclip, ExternalLink, Copy, Check
} from 'lucide-react';
import Link from 'next/link';

interface PerfilProps {
    candidato: any;
    fotoPerfil?: string;
    localidade: string;
    contato: { ddi?: string; ddd?: string; numero?: string };
    links: { url: string }[];
    anexos: { id: string; nome: string; mime: string; tamanho: number; criadoEm: string }[];
    perfilShareUrl: string;
}

export function CandidateProfile({ candidato, fotoPerfil, localidade, contato, links, anexos, perfilShareUrl }: PerfilProps) {
    const [copiado, setCopiado] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(perfilShareUrl);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 mb-6">
            {/* HEADER DO PERFIL */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-100 pb-8">
                <div className="relative">
                    <img
                        src={fotoPerfil || "/img/avatar.png"}
                        alt="Foto de perfil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-gray-200"
                    />
                </div>

                <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {candidato.nome || 'Usuário'} {candidato.sobrenome || ''}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><MapPin size={16} className="text-blue-500" /> {localidade}</span>
                                <span className="flex items-center gap-1">
                                    <Phone size={16} className="text-blue-500" />
                                    {contato.ddi || contato.ddd || contato.numero ? (
                                        `${contato.ddi ? `(+${contato.ddi}) ` : ''}${contato.ddd ? `${contato.ddd} ` : ''}${contato.numero}`
                                    ) : 'Não informado'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} className="text-blue-500" />
                                    {candidato.data_nascimento ? `Nascimento: ${new Date(candidato.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'Não informada'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/candidate/profile/editProfile">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition cursor-pointer">
                                    <PencilLine size={16} /> Editar perfil
                                </button>
                            </Link>
                            <button
                                onClick={handleCopyLink}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 relative cursor-pointer"
                                title="Copiar link do perfil"
                            >
                                {copiado ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
                                {copiado && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded">Copiado!</span>}
                            </button>
                        </div>
                    </div>

                    {/* SOBRE MIM */}
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                            <User size={14} /> Sobre mim
                        </h3>
                        <p className="text-gray-700 leading-relaxed italic">
                            {candidato.descricao || "Nenhuma descrição adicionada."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* ÁREAS DE INTERESSE */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Target className="text-blue-600" size={18} /> Áreas de Interesse
                        </h3>
                        <button className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">Editar áreas</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {candidato.candidato_area?.length > 0 ? (
                            candidato.candidato_area.map((ca: any, idx: number) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-medium">
                                    {ca.area_interesse?.nome || 'Área'}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm italic">Nenhuma área selecionada.</p>
                        )}
                    </div>
                </div>

                {/* LINKS */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <LinkIcon className="text-blue-600" size={18} /> Links do perfil
                    </h3>
                    <ul className="space-y-3">
                        {links.length > 0 ? links.map((link, idx) => (
                            <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
                                <a href={link.url} target="_blank" className="text-sm text-blue-600 truncate hover:underline">{link.url}</a>
                            </li>
                        )) : <li className="text-gray-400 text-sm">Nenhum link adicionado.</li>}
                    </ul>
                </div>

                {/* ANEXOS */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Paperclip className="text-blue-600" size={18} /> Anexos
                    </h3>
                    <div className="space-y-3">
                        {anexos.length > 0 ? anexos.map((a, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="truncate pr-4">
                                    <p className="text-sm font-medium text-gray-700 truncate">{a.nome}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">{a.mime} • {formatSize(a.tamanho)}</p>
                                </div>
                                <a href={`/anexos/${a.id}`} className="text-blue-600 hover:text-blue-800 p-2">
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        )) : <p className="text-gray-400 text-sm">Nenhum anexo encontrado.</p>}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Ícone de alvo (Target) não importado do Lucide no exemplo acima, adicionar se desejar:
const Target = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);