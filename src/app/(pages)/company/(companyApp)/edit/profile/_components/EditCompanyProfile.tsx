"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Camera, Upload, Save, AlertTriangle, X, Building2, MapPin, FileText, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditCompanyProfileProps {
    initialData: {
        id: string;
        nome_empresa: string | null;
        foto_perfil: string | null;
        descricao: string | null;
        telefone: string | null;
        cidade: string | null;
        estado: string | null;
        pais: string | null;
        anexos: any[];
    };
}

export function EditCompanyProfile({ initialData }: EditCompanyProfileProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<{
        nome_empresa: string;
        descricao: string;
        telefone: string;
        cidade: string;
        estado: string;
        pais: string;
        fotoPerfil: string | null | undefined;
        anexos: any[];
    }>({
        nome_empresa: initialData.nome_empresa || "",
        descricao: initialData.descricao || "",
        telefone: initialData.telefone || "",
        cidade: initialData.cidade || "",
        estado: initialData.estado || "",
        pais: initialData.pais || "Brasil",
        fotoPerfil: initialData.foto_perfil || undefined,
        anexos: initialData.anexos || [],
    });

    const [fotoPreview, setFotoPreview] = useState(initialData.foto_perfil || '/img/company-placeholder.png');
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFotoPreview(base64);
                setFormData(prev => ({ ...prev, fotoPerfil: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

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

    const removeAnexo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            anexos: prev.anexos.filter((_, i) => i !== index)
        }));
    };

    const handleViewAttachment = (anexo: any) => {
        const url = anexo.url || anexo.base64;
        const name = anexo.nome || 'Arquivo';

        if (!url) return;

        if (url.startsWith('data:')) {
            const fileKey = `temp_file_${Date.now()}`;
            sessionStorage.setItem(fileKey, url);
            window.open(`/viewer?fileKey=${fileKey}&title=${encodeURIComponent(name)}`, '_blank');
        } else {
            let finalUrl = url;
            let typeParam = '';

            const mime = anexo.mime || anexo.type || '';
            const isPdf = mime.includes('pdf') ||
                url.toLowerCase().includes('.pdf') ||
                name.toLowerCase().includes('.pdf');
            const isCloudinary = url.includes('cloudinary.com');

            if (isPdf && isCloudinary) {
                finalUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                typeParam = '&type=application/pdf';
            }

            window.open(`/viewer?url=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(name)}${typeParam}`, '_blank');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/company/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'success',
                    text: 'Perfil atualizado!'
                }));

                router.refresh();
                router.back();
                return;
            } else {
                setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <main className="max-w-5xl mx-auto py-10 px-4">
            {message && message.type === 'error' && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 min-w-[300px] p-4 rounded-xl flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-10 transition-all bg-white text-red-700 border-l-4 border-red-500">
                    <div className="p-2 rounded-full bg-red-100 uppercase">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">Erro</span>
                        <span className="text-sm text-gray-600">{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Left Column - Photo */}
                    <div className="md:col-span-4 flex flex-col items-center">
                        <div className="relative group">
                            <img
                                src={fotoPreview}
                                alt="Preview"
                                className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-xl ring-1 ring-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                                className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-transform hover:scale-110"
                            >
                                <Camera size={20} />
                            </button>
                        </div>

                        {showPhotoOptions && (
                            <div className="mt-4 flex flex-col gap-2 w-full max-w-[200px] animate-in fade-in slide-in-from-top-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                                >
                                    <Upload size={16} /> Upload Arquivo
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    className="text-red-500 text-xs font-semibold hover:underline mt-2 cursor-pointer"
                                    onClick={() => {
                                        setFotoPreview('/img/company-placeholder.png');
                                        setFormData(prev => ({ ...prev, fotoPerfil: null }));
                                    }}
                                >
                                    Remover foto
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="md:col-span-8 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Editar Perfil da Empresa</h2>

                        {/* Company Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600">Nome da Empresa *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.nome_empresa}
                                onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600">Telefone</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                placeholder="(11) 98765-4321"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-1 relative">
                            <label className="text-sm font-semibold text-gray-600">Localização</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.cidade}
                                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        placeholder="UF"
                                        maxLength={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.pais}
                                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                        placeholder="País"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Building2 size={16} /> Sobre a Empresa
                            </label>
                            <textarea
                                rows={5}
                                maxLength={1000}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                placeholder="Descreva sua empresa, missão, valores e cultura..."
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                value={formData.descricao}
                            />
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                <span>Dica: foque na missão e valores da empresa</span>
                                <span>{formData.descricao?.length || 0}/1000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Anexos Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mt-10">
                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                        <FileText size={20} className="text-blue-600" />
                        <h3>Gestão de Anexos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-8">
                            <Upload className="text-gray-300 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-600">Clique para enviar arquivos</p>
                            <p className="text-[10px] text-gray-400 mt-1 text-center">PDF, DOCX ou Imagens (Máx 10MB)</p>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                id="anexos-upload"
                                onChange={handleAnexosChange}
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <label htmlFor="anexos-upload" className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-black transition">Selecionar Arquivos</label>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Arquivos da Empresa ({formData.anexos.length})</h4>
                            {formData.anexos.map((a, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{a.nome}</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleViewAttachment(a)}
                                            className="text-blue-500 p-1 hover:bg-blue-50 rounded cursor-pointer"
                                            title="Visualizar arquivo"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeAnexo(i)}
                                            className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                                            title="Remover arquivo"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 border-t">
                    <div className="flex gap-4 w-full md:w-auto md:ml-auto">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 md:flex-none px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}
