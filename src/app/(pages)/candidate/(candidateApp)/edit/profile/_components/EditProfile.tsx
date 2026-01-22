"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Camera, Upload, Trash2, MapPin, PlusCircle,
    FileText, X, Save, AlertTriangle, User, UserCircle, Check, Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { EditProfileProps } from '@/src/app/(pages)/candidate/(candidateApp)/types/EditProfileProps';

export function EditProfile({ initialData }: EditProfileProps) {
    const { t } = useTranslation();
    const router = useRouter();
    // Estados do Formulário
    const [formData, setFormData] = useState({
        ...initialData,
        pais: initialData.pais || "Brasil"
    });
    const [links, setLinks] = useState(initialData.links.length > 0 ? initialData.links : [{ label: '', url: '' }]);
    const [fotoPreview, setFotoPreview] = useState(initialData.fotoPerfil || null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Gerenciamento de Links (Máx 5)
    const addLink = () => {
        if (links.length < 5) setLinks([...links, { label: '', url: '' }]);
        else alert('Você pode adicionar no máximo 5 links.');
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
        const lowerName = name.toLowerCase();
        const lowerUrl = url.toLowerCase();

        const isPdf = mime.includes('pdf') ||
            lowerUrl.includes('.pdf') ||
            lowerUrl.includes('/pdf') ||
            lowerName.endsWith('.pdf');

        const isCloudinary = url.includes('cloudinary.com');

        if (url.startsWith('data:')) {
            const fileKey = `temp_file_${Date.now()}`;
            sessionStorage.setItem(fileKey, url);
            const typeParam = isPdf ? '&type=application/pdf' : '';
            window.open(`/viewer?fileKey=${fileKey}&title=${encodeURIComponent(name)}${typeParam}`, '_blank');
        } else {
            let finalUrl = url;
            let typeParam = '';

            if (isPdf) {
                if (isCloudinary) {
                    finalUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                }
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
            const res = await fetch('/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, links }),
            });

            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'success',
                    text: t('profile_updated')
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
                        <span className="font-bold text-gray-900">{t('edit_profile_error_title')}</span>
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
                            {fotoPreview ? (
                                <img
                                    src={fotoPreview}
                                    alt="Preview"
                                    className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-xl ring-1 ring-gray-200"
                                />
                            ) : (
                                <div className="w-56 h-56 rounded-full bg-slate-100 border-4 border-white shadow-xl ring-1 ring-gray-200 flex items-center justify-center">
                                    <User size={64} className="text-slate-400" />
                                </div>
                            )}
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
                                    <Upload size={16} /> {t('edit_profile_upload_file')}
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
                                        setFotoPreview(null);
                                        setFormData(prev => ({ ...prev, fotoPerfil: null }));
                                    }}
                                >
                                    {t('edit_profile_remove_photo')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">{t('edit_profile_title')}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('edit_profile_name_label')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.nome || ''}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('edit_profile_surname_label')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.sobrenome || ''}
                                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1 relative">
                            <label className="text-sm font-semibold text-gray-600">{t('edit_profile_location_label')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.cidade || ''}
                                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                        placeholder={t('city_placeholder')}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.estado || ''}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        placeholder={t('state_placeholder')}
                                        maxLength={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.pais || ''}
                                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                        placeholder={t('country_placeholder')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="w-24 space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('ddi_label')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+</span>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.ddi || ''}
                                        onChange={(e) => setFormData({ ...formData, ddi: e.target.value.replace(/\D/g, '') })}
                                        placeholder="55"
                                    />
                                </div>
                            </div>
                            <div className="w-20 space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('ddd_label')}</label>
                                <input type="text" maxLength={2} className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none" value={formData.ddd || ''} onChange={(e) => setFormData({ ...formData, ddd: e.target.value })} />
                            </div>
                            <div className="flex-1 min-w-[150px] space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('number_label')}</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.numero || ''} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <UserCircle size={16} /> {t('edit_profile_description_label')}
                            </label>
                            <textarea
                                rows={4}
                                maxLength={600}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                placeholder={t('edit_profile_description_placeholder')}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                value={formData.descricao || ''}
                            />
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                <span>{t('edit_profile_description_tip')}</span>
                                <span>{formData.descricao?.length || 0}/600</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-600">{t('edit_profile_links_label')}</label>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="text-blue-600 flex items-center gap-1 text-sm font-bold hover:text-blue-800 cursor-pointer"
                                >
                                    <PlusCircle size={16} /> {t('edit_profile_add_link')}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 animate-in slide-in-from-left-2">
                                        <input
                                            type="text"
                                            placeholder={t('edit_profile_link_title_placeholder')}
                                            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={link.label}
                                            onChange={(e) => updateLink(idx, 'label', e.target.value)}
                                        />
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="url"
                                                placeholder="https://..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={link.url}
                                                onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeLink(idx)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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

                {/* Anexos Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mt-10">
                    <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                        <FileText size={20} className="text-blue-600" />
                        <h3>{t('edit_profile_attachments_title')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-8">
                            <Upload className="text-gray-300 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-600">{t('edit_profile_attachments_click')}</p>
                            <p className="text-[10px] text-gray-400 mt-1 text-center">{t('edit_profile_attachments_formats')}</p>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                id="anexos-upload"
                                onChange={handleAnexosChange}
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <label htmlFor="anexos-upload" className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-black transition">{t('edit_profile_select_files')}</label>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('edit_profile_my_files')} ({formData.anexos.length})</h4>
                            {formData.anexos.map((a, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{a.nome}</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleViewAttachment(a)}
                                            className="text-blue-500 p-1 hover:bg-blue-50 rounded cursor-pointer"
                                            title={t('edit_profile_view_file')}
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeAnexo(i)}
                                            className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                                            title={t('edit_profile_remove_file')}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 border-t">
                    <button type="button" className="text-red-500 flex items-center gap-2 text-sm font-semibold cursor-pointer hover:bg-red-50 px-4 py-2 rounded-lg transition">
                        <AlertTriangle size={18} /> {t('edit_profile_delete_account')}
                    </button>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button type="button" onClick={handleCancel} className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition cursor-pointer">
                            {t('edit_profile_cancel')}
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
                            {isLoading ? t('edit_profile_saving') : t('edit_profile_save')}
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}