"use client";

import { Building2, MapPin, Phone, Mail, Edit, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
}

export function CompanyProfile({ company, fotoPerfil, localidade, contato, email, anexos, links }: CompanyProfileProps) {
    const [formData, setFormData] = useState({
        anexos: [] as { nome: string, base64: string, size: number, type: string }[]
    });
    const telefoneCompleto = contato.ddi
        ? `+${contato.ddi} (${contato.ddd}) ${contato.numero}`
        : contato.ddd
            ? `(${contato.ddd}) ${contato.numero}`
            : contato.numero;

    const handleAnexosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newAnexos = [...formData.anexos];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            const filePromise = new Promise<{ nome: string, base64: string, size: number, type: string }>((resolve) => {
                reader.onloadend = () => {
                    resolve({
                        nome: file.name,
                        base64: reader.result as string,
                        size: file.size,
                        type: file.type
                    });
                };
            });

            reader.readAsDataURL(file);
            const result = await filePromise;
            newAnexos.push(result);
        }

        setFormData(prev => ({ ...prev, anexos: newAnexos }));
    };
    const handleViewFile = async (anexo: any) => {
        const url = anexo.url || anexo.base64;
        const nome = anexo.nome || 'Arquivo';

        // console.log('[handleViewFile] Iniciando visualização:', { nome, url: url?.substring(0, 100), anexo });

        if (!url) {
            console.error('[handleViewFile] URL vazia!');
            alert('Erro: URL do arquivo não encontrada');
            return;
        }

        // Verifica se é PDF para aplicar lógica especial
        const mime = anexo.mime || anexo.type || '';
        const isPdf = mime.includes('pdf') || url.toLowerCase().includes('.pdf');

        // console.log('[handleViewFile] Tipo de arquivo:', { mime, isPdf });

        if (isPdf) {
            try {
                // console.log('[handleViewFile] É PDF, abrindo viewer com proxy...');

                // Usa a API proxy diretamente no viewer
                const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                const viewerUrl = `/viewer?url=${encodeURIComponent(proxyUrl)}&title=${encodeURIComponent(nome)}&type=application/pdf`;

                // console.log('[handleViewFile] Proxy URL:', proxyUrl);
                // console.log('[handleViewFile] Abrindo viewer:', viewerUrl);
                window.open(viewerUrl, '_blank');
                return;
            } catch (error) {
                console.error("[handleViewFile] Erro ao abrir PDF:", error);
                alert(`Erro ao carregar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            }
        }

        // Para outros tipos de arquivo ou fallback
        const mimeType = anexo.mime || anexo.type || '';
        const viewerUrl = `/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(nome)}&type=${encodeURIComponent(mimeType)}`;
        console.log('[handleViewFile] Abrindo viewer (não-PDF ou fallback):', viewerUrl);
        window.open(viewerUrl, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Company Logo */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white shadow-lg flex-shrink-0 border-4 border-white">
                        {fotoPerfil ? (
                            <Image
                                src={fotoPerfil}
                                alt={company.nome_empresa || "Empresa"}
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
                    <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            {company.nome_empresa || "Nome da Empresa"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-blue-600" />
                                <span>{localidade}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Link
                        href="/company/edit/profile"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Edit size={18} />
                        Editar Perfil
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - About */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-blue-600" />
                            Sobre a Empresa
                        </h3>
                        {company.descricao ? (
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {company.descricao}
                            </p>
                        ) : (
                            <p className="text-gray-400 italic">
                                Nenhuma descrição adicionada ainda.
                            </p>
                        )}
                    </div>

                    {/* Files Section */}
                    {anexos && anexos.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" />
                                Documentos e Anexos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {anexos.map((arquivo) => (
                                    <button
                                        key={arquivo.id}
                                        onClick={() => handleViewFile(arquivo)}
                                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
                                    >
                                        <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-blue-100 text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">
                                                {arquivo.nome}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                                {(arquivo.tamanho / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Contact & Details */}
                <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Contato</h3>
                        <div className="space-y-3">
                            {email && (
                                <div className="flex items-start gap-3">
                                    <Mail size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">E-mail</p>
                                        <a
                                            href={`mailto:${email}`}
                                            className="text-sm text-gray-900 hover:text-blue-600 transition-colors break-all"
                                        >
                                            {email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {telefoneCompleto && telefoneCompleto !== '' && (
                                <div className="flex items-start gap-3">
                                    <Phone size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
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
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <ExternalLink size={20} className="text-blue-600" />
                                Links e Redes
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
                                                {link.label || 'Acesse o Link'}
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
        </div>
    );
}
