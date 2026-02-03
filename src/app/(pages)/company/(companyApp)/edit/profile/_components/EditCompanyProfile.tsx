"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Camera, Upload, Save, AlertTriangle, X, Building2, MapPin, FileText, Eye, PlusCircle, Trash2, Link as LinkIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";

interface EditCompanyProfileProps {
    initialData: {
        id: string;
        nome_empresa: string | null;
        foto_perfil: string | null;
        descricao: string | null;
        ddi?: string;
        ddd?: string;
        numero?: string;
        cidade: string | null;
        estado: string | null;
        pais: string | null;
        anexos: any[];
        links: any[];
    };
}

export function EditCompanyProfile({ initialData }: EditCompanyProfileProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [formData, setFormData] = useState<{
        nome_empresa: string;
        descricao: string;
        ddi: string;
        ddd: string;
        numero: string;
        cidade: string;
        estado: string;
        pais: string;
        fotoPerfil: string | null | undefined;
        anexos: any[];
        links: any[];
    }>({
        nome_empresa: initialData.nome_empresa || "",
        descricao: initialData.descricao || "",
        ddi: initialData.ddi || "",
        ddd: initialData.ddd || "",
        numero: initialData.numero || "",
        cidade: initialData.cidade || "",
        estado: initialData.estado || "",
        pais: initialData.pais || "Brasil",
        fotoPerfil: initialData.foto_perfil || undefined,
        anexos: initialData.anexos || [],
        links: initialData.links.length > 0 ? initialData.links : [{ label: '', url: '' }],
    });

    const [fotoPreview, setFotoPreview] = useState(initialData.foto_perfil || null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Gerenciamento de Links (Máx 5)
    const addLink = () => {
        if (formData.links.length < 5) {
            setFormData(prev => ({
                ...prev,
                links: [...prev.links, { label: '', url: '' }]
            }));
        } else {
            alert(t('max_links_alert'));
        }
    };

    const updateLink = (index: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...formData.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, links: newLinks }));
    };

    const removeLink = (index: number) => {
        if (formData.links.length === 1) {
            setFormData(prev => ({
                ...prev,
                links: [{ label: '', url: '' }]
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
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
        const name = anexo.nome || t('vacancy_file_name_default');

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
        e.preventDefault();
        setIsLoading(true);

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
                    text: t('profile_updated')
                }));
                window.dispatchEvent(new Event('storage'));
                router.refresh();
                // Removed router.back() to keep user on page with toast
            } else {
                localStorage.setItem('global_toast', JSON.stringify({
                    type: 'error',
                    text: result.error || t('profile_update_error')
                }));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            localStorage.setItem('global_toast', JSON.stringify({
                type: 'error',
                text: t('connection_error')
            }));
            window.dispatchEvent(new Event('storage'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
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
                window.location.href = '/login';
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

        if (normalize(formData.nome_empresa) !== normalize(initialData.nome_empresa)) return true;
        if (normalize(formData.descricao) !== normalize(initialData.descricao)) return true;
        if (normalize(formData.cidade) !== normalize(initialData.cidade)) return true;
        if (normalize(formData.estado) !== normalize(initialData.estado)) return true;
        if (normalize(formData.pais) !== normalize(initialData.pais || "Brasil")) return true;
        if (normalize(formData.ddi) !== normalize(initialData.ddi)) return true;
        if (normalize(formData.ddd) !== normalize(initialData.ddd)) return true;
        if (normalize(formData.numero) !== normalize(initialData.numero)) return true;

        if (formData.fotoPerfil !== (initialData.foto_perfil || undefined)) return true;

        if (JSON.stringify(formData.anexos) !== JSON.stringify(initialData.anexos)) return true;

        const initialLinks = initialData.links.length > 0 ? initialData.links : [{ label: '', url: '' }];
        if (JSON.stringify(formData.links) !== JSON.stringify(initialLinks)) return true;

        return false;
    }, [formData, initialData]);

    return (
        <main className="max-w-5xl mx-auto py-10 px-4">


            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Left Column - Photo */}
                    <div className="md:col-span-4 flex flex-col items-center">
                        <div className="relative group">
                            {fotoPreview ? (
                                <img
                                    src={fotoPreview}
                                    alt="Preview"
                                    className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-xl ring-1 ring-gray-200"
                                />
                            ) : (
                                <div className="w-56 h-56 rounded-full bg-gray-100 border-4 border-white shadow-xl ring-1 ring-gray-200 flex items-center justify-center">
                                    <Building2 size={80} className="text-gray-400" />
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
                                    <Upload size={16} /> {t('upload_file')}
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
                                    {t('remove_photo')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="md:col-span-8 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">{t('edit_company_profile_title')}</h2>

                        {/* Company Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600">{t('company_name')} *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={formData.nome_empresa}
                                onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-wrap gap-4">
                            <div className="w-24 space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('ddi')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+</span>
                                    <input
                                        type="text"
                                        maxLength={3}
                                        className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.ddi}
                                        onChange={(e) => setFormData({ ...formData, ddi: e.target.value.replace(/\D/g, '') })}
                                        placeholder="55"
                                    />
                                </div>
                            </div>
                            <div className="w-20 space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('ddd')}</label>
                                <input
                                    type="text"
                                    maxLength={2}
                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.ddd}
                                    onChange={(e) => setFormData({ ...formData, ddd: e.target.value.replace(/\D/g, '') })}
                                    placeholder="11"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px] space-y-1">
                                <label className="text-sm font-semibold text-gray-600">{t('number')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.numero}
                                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1 relative">
                            <label className="text-sm font-semibold text-gray-600">{t('location')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.cidade}
                                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                        placeholder={t('city')}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        placeholder={t('state_abbr')}
                                        maxLength={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formData.pais}
                                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                        placeholder={t('country')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Building2 size={16} /> {t('about_company')}
                            </label>
                            <textarea
                                rows={5}
                                maxLength={1000}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                placeholder={t('company_description_placeholder')}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                value={formData.descricao}
                            />
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                <span>{t('company_description_hint')}</span>
                                <span>{formData.descricao?.length || 0}/1000</span>
                            </div>
                        </div>

                        {/* Links do perfil */}
                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <LinkIcon size={16} /> {t('company_links')}
                                </label>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="text-blue-600 flex items-center gap-1 text-sm font-bold hover:text-blue-800 cursor-pointer"
                                >
                                    <PlusCircle size={16} /> {t('add_link')}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.links.map((link, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 animate-in slide-in-from-left-2">
                                        <input
                                            type="text"
                                            placeholder={t('link_title_placeholder')}
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
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
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
                        <h3>{t('attachment_management')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-8">
                            <Upload className="text-gray-300 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-600">{t('click_to_upload')}</p>
                            <p className="text-[10px] text-gray-400 mt-1 text-center">{t('upload_hint')}</p>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                id="anexos-upload"
                                onChange={handleAnexosChange}
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <label htmlFor="anexos-upload" className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-black transition">{t('select_files')}</label>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('company_files')} ({formData.anexos.length})</h4>
                            {formData.anexos.map((a, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{a.nome}</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleViewAttachment(a)}
                                            className="text-blue-500 p-1 hover:bg-blue-50 rounded cursor-pointer"
                                            title={t('view_file_tooltip')}
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeAnexo(i)}
                                            className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"
                                            title={t('remove_file_tooltip')}
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
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-500 flex items-center gap-2 text-sm font-semibold cursor-pointer hover:bg-red-50 px-4 py-2 rounded-lg transition"
                    >
                        <AlertTriangle size={18} /> {t('edit_profile_delete_account')}
                    </button>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !hasChanges}
                            className={`flex-1 md:flex-none px-4 py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer 
                                ${isLoading || !hasChanges
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                    : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"}`
                            }
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {isLoading ? t('saving') : t('save_changes')}
                        </button>
                    </div>
                </div>
            </form>

            {/* Modal de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('delete_account_modal_title')}</h3>
                            <p className="text-gray-500 mb-6 font-medium">
                                {t('delete_account_modal_desc')}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition cursor-pointer"
                                >
                                    {t('delete_account_modal_cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
