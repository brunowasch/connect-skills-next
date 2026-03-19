"use client";

import React, { useState, useRef, useMemo } from 'react';
import {
    Camera, Upload, Trash2,
    Save, AlertTriangle, UserCircle, PlusCircle, X, Eye, FileText, User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export interface EditMentorProfileProps {
    initialData: {
        nome: string;
        sobrenome: string;
        cidade: string;
        estado: string;
        pais: string;
        ddi: string;
        ddd: string;
        numero: string;
        bio: string;
        fotoPerfil?: string;
        links: { id?: string; label: string; url: string; ordem?: number }[];
        anexos: { id?: string; nome: string; url?: string; base64?: string; mime?: string; type?: string; tamanho?: number; size?: number; criadoEm?: string }[];
    };
}

export function EditMentorProfile({ initialData }: EditMentorProfileProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [formData, setFormData] = useState({
        ...initialData
    });

    const [links, setLinks] = useState(initialData.links.length > 0 ? initialData.links : [{ label: '', url: '' }]);
    const [fotoPreview, setFotoPreview] = useState(initialData.fotoPerfil || null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLink = () => {
        if (links.length < 5) {
            setLinks([...links, { label: '', url: '' }]);
        }
    };

    const updateLink = (index: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setLinks(newLinks);
    };

    const removeLink = (index: number) => {
        if (links.length === 1) {
            setLinks([{ label: '', url: '' }]);
            return;
        }
        setLinks(links.filter((_, i) => i !== index));
    };

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

        const mime = (anexo.mime || anexo.type || '').toLowerCase();
        const isPdf = mime.includes('pdf') || name.toLowerCase().endsWith('.pdf');

        if (url.startsWith('data:')) {
            const fileKey = `temp_file_${Date.now()}`;
            sessionStorage.setItem(fileKey, url);
            window.open(`/viewer?fileKey=${fileKey}&title=${encodeURIComponent(name)}${isPdf ? '&type=application/pdf' : ''}`, '_blank');
        } else {
            window.open(`/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(name)}${isPdf ? '&type=application/pdf' : ''}`, '_blank');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.nome?.trim()) {
            localStorage.setItem('global_toast', JSON.stringify({
                type: 'error',
                text: t('validation_name_required', 'Nome é obrigatório.')
            }));
            window.dispatchEvent(new Event('storage'));
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/mentor/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, links }),
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'success',
                    text: t('edit_profile_success', 'Perfil atualizado com sucesso!')
                }));
                window.dispatchEvent(new Event('storage'));
                router.refresh();
                router.push('/mentor/profile');
            } else {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'error',
                    text: result.error || 'Erro ao atualizar perfil.'
                }));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            localStorage.setItem('global_toast', JSON.stringify({
                type: 'error',
                text: 'Erro de conexão com o servidor.'
            }));
            window.dispatchEvent(new Event('storage'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/delete', { method: 'DELETE' });
            if (res.ok) {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'success',
                    text: 'Conta excluída com sucesso.'
                }));
                window.dispatchEvent(new Event('storage'));
                window.location.href = '/';
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir conta');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
        }
    };

    const hasChanges = useMemo(() => {
        const normalize = (val: any) => val === null || val === undefined ? '' : String(val).trim();
        if (normalize(formData.nome) !== normalize(initialData.nome)) return true;
        if (normalize(formData.sobrenome) !== normalize(initialData.sobrenome)) return true;
        if (normalize(formData.cidade) !== normalize(initialData.cidade)) return true;
        if (normalize(formData.estado) !== normalize(initialData.estado)) return true;
        if (normalize(formData.pais) !== normalize(initialData.pais)) return true;
        if (normalize(formData.ddi) !== normalize(initialData.ddi)) return true;
        if (normalize(formData.ddd) !== normalize(initialData.ddd)) return true;
        if (normalize(formData.numero) !== normalize(initialData.numero)) return true;
        if (normalize(formData.bio) !== normalize(initialData.bio)) return true;
        if (formData.fotoPerfil !== initialData.fotoPerfil) return true;
        if (JSON.stringify(links) !== JSON.stringify(initialData.links)) return true;
        if (JSON.stringify(formData.anexos) !== JSON.stringify(initialData.anexos)) return true;
        return false;
    }, [formData, links, initialData]);

    return (
        <main className="max-w-6xl mx-auto py-10 px-4 font-outfit text-[#334155]">
            <form onSubmit={handleSubmit} className="space-y-10">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Left Side: Avatar */}
                    <div className="md:col-span-4 flex flex-col items-center pt-4">
                        <div className="relative group">
                            {fotoPreview ? (
                                <img
                                    src={fotoPreview}
                                    alt="Preview"
                                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-full object-cover border-4 border-white shadow-2xl ring-1 ring-slate-100"
                                />
                            ) : (
                                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-slate-100 border-4 border-white shadow-2xl ring-1 ring-slate-100 flex items-center justify-center text-slate-400">
                                    <User size={80} strokeWidth={1.5} />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-4 right-4 bg-[#2563eb] text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-transform hover:scale-110"
                            >
                                <Camera size={20} />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <div className="flex justify-between items-center border-b-[1px] border-slate-200 pb-2 mb-10">
                            <h1 className="text-[28px] font-bold text-[#1e293b] tracking-tight">{t('edit_profile_title', 'Editar Perfil')}</h1>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#334155]">{t('edit_profile_name_label', 'Nome')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                                    value={formData.nome || ''}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#334155]">{t('edit_profile_surname_label', 'Sobrenome')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                                    value={formData.sobrenome || ''}
                                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-8 space-y-1.5">
                            <label className="text-xs font-bold text-[#334155]">{t('edit_profile_location_label', 'Localização')}</label>
                            <div className="grid grid-cols-6 gap-4">
                                <input
                                    type="text"
                                    className="col-span-3 px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                                    value={formData.cidade || ''}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                    placeholder={t('city_placeholder', 'Cidade')}
                                />
                                <input
                                    type="text"
                                    className="col-span-1 px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-center"
                                    value={formData.estado || ''}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    placeholder={t('state_placeholder', 'UF')}
                                    maxLength={2}
                                />
                                <input
                                    type="text"
                                    className="col-span-2 px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                                    value={formData.pais || 'Brasil'}
                                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                    placeholder={t('country_placeholder', 'Brasil')}
                                />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-6 gap-4">
                            <div className="col-span-1 space-y-1.5">
                                <label className="text-xs font-bold text-[#334155]">{t('ddi_label', 'DDI')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">+</span>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full pl-7 pr-2 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                                        value={formData.ddi || ''}
                                        onChange={(e) => setFormData({ ...formData, ddi: e.target.value.replace(/\D/g, '') })}
                                        placeholder="00"
                                    />
                                </div>
                            </div>
                            <div className="col-span-5 space-y-1.5">
                                <label className="text-xs font-bold text-[#334155]">{t('number_label', 'Número')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                                    value={[formData.ddd, formData.numero].filter(Boolean).join(" ")}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 11) val = val.slice(0, 11);
                                        let ddd = val.slice(0, 2);
                                        let numero = val.slice(2);
                                        if (numero.length > 5) {
                                            numero = `${numero.slice(0, numero.length - 4)}-${numero.slice(-4)}`;
                                        }
                                        setFormData({ ...formData, ddd, numero });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-4">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <UserCircle size={16} /> {t('edit_profile_description_label', 'Descrição (Sobre você)')}
                            </label>
                            <textarea
                                rows={4}
                                maxLength={600}
                                className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-sm leading-relaxed"
                                placeholder={t('edit_profile_description_placeholder', 'Conte um pouco sobre você...')}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                value={formData.bio || ''}
                            />
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                <span>{t('edit_profile_description_tip', 'DICA: FOQUE NAS SUAS EXPERIÊNCIAS PRINCIPAIS')}</span>
                                <span>{formData.bio?.length || 0}/600</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <label className="text-sm font-semibold text-gray-600">{t('edit_profile_links_label', 'Links do perfil')}</label>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="text-blue-600 flex items-center gap-1 text-sm font-bold hover:text-blue-800 transition-all cursor-pointer"
                                >
                                    <PlusCircle size={16} /> {t('edit_profile_add_link', 'Adicionar link')}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 animate-in slide-in-from-left-2">
                                        <input
                                            type="text"
                                            placeholder={t('edit_profile_link_title_placeholder', 'Título (ex: LinkedIn, GitHub)')}
                                            className="w-full sm:w-1/3 px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            value={link.label}
                                            onChange={(e) => updateLink(idx, 'label', e.target.value)}
                                        />
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                className="flex-1 px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                value={link.url}
                                                onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeLink(idx)}
                                                className="p-2 text-[#ef4444] opacity-50 hover:opacity-100 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0] mt-10">
                    <div className="flex items-center gap-2 mb-4 text-[#1e293b] font-bold">
                        <FileText size={20} className="text-[#3b82f6]" />
                        <h3>{t('edit_profile_attachments_title', 'Gestão de Anexos')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#e2e8f0] pt-6">
                        <div className="p-8 flex flex-col items-center justify-center border-r border-[#e2e8f0]">
                            <div className="w-full max-w-xs p-8 rounded-xl border-2 border-dashed border-[#e2e8f0] flex flex-col items-center justify-center bg-white transition-colors hover:border-blue-300">
                                <Upload className="text-[#94a3b8] mb-4" size={32} />
                                <p className="text-xs font-bold text-[#64748b] text-center mb-1">{t('edit_profile_attachments_click', 'Clique para enviar arquivos')}</p>
                                <p className="text-[10px] text-[#94a3b8] font-medium text-center">{t('edit_profile_attachments_formats', 'PDF, DOCX ou Imagens (Máx 10MB)')}</p>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    id="anexos-upload"
                                    onChange={handleAnexosChange}
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                                <label htmlFor="anexos-upload" className="mt-6 bg-[#0f172a] text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-black transition-all">
                                    {t('edit_profile_select_files', 'Selecionar Arquivos')}
                                </label>
                            </div>
                        </div>

                        <div className="p-8">
                            <h4 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4">{t('edit_profile_my_files', 'Meus Arquivos')} ({formData.anexos.length})</h4>
                            <div className="space-y-2">
                                {formData.anexos.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#f1f5f9] shadow-sm transition-all hover:bg-slate-50">
                                        <span className="text-xs text-[#334155] font-bold truncate max-w-[200px]">{a.nome}</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleViewAttachment(a)}
                                                className="text-blue-500 p-1 hover:bg-blue-50 rounded cursor-pointer"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeAnexo(i)}
                                                className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-900 mt-12">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="text-[#ef4444] flex items-center gap-2 text-xs font-bold cursor-pointer hover:underline"
                    >
                        <AlertTriangle size={16} /> {t('edit_profile_delete_account', 'Excluir minha conta')}
                    </button>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-[#f1f5f9] text-[#475569] rounded-lg font-bold text-sm transition-all hover:bg-[#e2e8f0] cursor-pointer"
                        >
                            {t('edit_profile_cancel', 'Cancelar')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !hasChanges || !formData.nome?.trim()}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer 
                                ${isLoading || !hasChanges || !formData.nome?.trim()
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"}`
                            }
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isLoading ? t('edit_profile_saving', 'Salvando...') : t('edit_profile_save', 'Salvar Alterações')}
                        </button>
                    </div>
                </div>
            </form>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 text-red-600">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('delete_account_modal_title')}</h3>
                            <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                                {t('delete_account_modal_desc')}
                            </p>
                            <div className="flex gap-4 w-full">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all cursor-pointer"
                                >
                                    {t('delete_account_modal_cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        t('delete_account_modal_confirm')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
