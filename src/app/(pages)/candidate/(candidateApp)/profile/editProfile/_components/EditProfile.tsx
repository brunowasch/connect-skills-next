"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Camera, Upload, Trash2, MapPin, PlusCircle,
    FileText, X, Save, AlertTriangle, UserCircle, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EditProfileProps } from '@/src/app/(pages)/candidate/(candidateApp)/types/EditProfileProps';

export function EditProfile({ initialData }: EditProfileProps) {
    const router = useRouter();
    // Estados do Formulário
    const [formData, setFormData] = useState(initialData);
    const [links, setLinks] = useState(initialData.links.length > 0 ? initialData.links : [{ url: '' }]);
    const [fotoPreview, setFotoPreview] = useState(initialData.fotoPerfil || '/img/avatar.png');
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Gerenciamento de Links (Máx 5)
    const addLink = () => {
        if (links.length < 5) setLinks([...links, { url: '' }]);
        else alert('Você pode adicionar no máximo 5 links.');
    };

    const updateLink = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index].url = value;
        setLinks(newLinks);
    };

    const removeLink = (index: number) => {
        if (links.length === 1) {
            setLinks([{ url: '' }]);
            return;
        }
        setLinks(links.filter((_, i) => i !== index));
    };

    // 2. Gerenciamento de Foto
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

    // 3. Submissão do Formulário
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/candidate/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    links: links.filter(l => l.url.trim() !== ''),
                }),
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'success',
                    text: 'Perfil atualizado com sucesso!'
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
                <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 min-w-[300px] p-4 rounded-xl flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-10 transition-all bg-white text-red-700 border-l-4 border-red-500`}>
                    <div className="p-2 rounded-full bg-red-100 uppercase">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">Erro</span>
                        <span className="text-sm text-gray-600">{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

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
                                        setFotoPreview('/img/avatar.png');
                                        setFormData(prev => ({ ...prev, fotoPerfil: '/img/avatar.png' }));
                                    }}
                                >
                                    Remover foto
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Editar Perfil</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Nome *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Sobrenome</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.sobrenome}
                                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1 relative">
                            <label className="text-sm font-semibold text-gray-600">Localidade</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Ex: Sapiranga, RS"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.localidade}
                                    onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                                />
                            </div>
                            <button type="button" className="text-xs text-blue-600 font-medium hover:underline mt-1">
                                Detectar localização automaticamente
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="w-20 space-y-1">
                                <label className="text-sm font-semibold text-gray-600">DDI</label>
                                <div className="bg-gray-50 border border-gray-300 rounded-lg py-2 text-center text-gray-500 font-medium">+55</div>
                            </div>
                            <div className="w-20 space-y-1">
                                <label className="text-sm font-semibold text-gray-600">DDD</label>
                                <input type="text" maxLength={2} className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none" value={formData.ddd} onChange={(e) => setFormData({ ...formData, ddd: e.target.value })} />
                            </div>
                            <div className="flex-1 min-w-[150px] space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Número</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <UserCircle size={16} /> Descrição (Sobre você)
                            </label>
                            <textarea
                                rows={4}
                                maxLength={600}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                placeholder="Conte um pouco sobre você..."
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                value={formData.descricao}
                            />
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                <span>Dica: foque nas suas experiências principais</span>
                                <span>{formData.descricao?.length || 0}/600</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-600">Links do perfil</label>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="text-blue-600 flex items-center gap-1 text-sm font-bold hover:text-blue-800"
                                >
                                    <PlusCircle size={16} /> Adicionar link
                                </button>
                            </div>
                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2">
                                        <input
                                            type="url"
                                            placeholder="https://linkedin.com/in/user"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={link.url}
                                            onChange={(e) => updateLink(idx, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeLink(idx)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

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
                            <input type="file" multiple className="hidden" id="anexos-upload" />
                            <label htmlFor="anexos-upload" className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-black transition">Selecionar Arquivos</label>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meus Arquivos ({formData.anexos.length})</h4>
                            {formData.anexos.map((a, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{a.nome}</span>
                                    <div className="flex gap-2">
                                        <button className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Upload size={14} /></button>
                                        <button className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 border-t">
                    <button type="button" className="text-red-500 flex items-center gap-2 text-sm font-semibold cursor-pointer hover:bg-red-50 px-4 py-2 rounded-lg transition">
                        <AlertTriangle size={18} /> Excluir minha conta
                    </button>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button type="button" onClick={handleCancel} className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition cursor-pointer">
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