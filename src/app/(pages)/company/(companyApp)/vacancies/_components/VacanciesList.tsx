"use client";

import { useState } from "react";
import { CompanyVacancyCard } from "./CompanyVacancyCard";
import Link from "next/link";
import { Plus, CheckSquare, Square, Trash2, Ban, Unlock, X, AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";


interface Vacancy {
    id: string;
    uuid: string | null;
    cargo: string;
    tipo_local_trabalho: any;
    escala_trabalho: string;
    created_at: Date;
    status: string;
    _count: {
        vaga_avaliacao: number;
    };
    stats?: {
        total: number;
        pendingVideo: number;
        noVideo: number;
        feedbackGiven: number;
    };
}

export function VacanciesList({ initialVacancies }: { initialVacancies: any[] }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        description: React.ReactNode;
        confirmText: string;
        variant: 'danger' | 'warning' | 'success';
        action: () => Promise<void>;
    } | null>(null);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]);
    };

    const toggleSelectVacancy = (uuid: string) => {
        if (!uuid) return;
        setSelectedIds(prev =>
            prev.includes(uuid) ? prev.filter(i => i !== uuid) : [...prev, uuid]
        );
    };

    const selectAll = () => {
        const selectables = initialVacancies.map(v => v.uuid).filter(Boolean) as string[];
        if (selectedIds.length === selectables.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(selectables);
        }
    };

    const handleBulkAction = async (type: 'delete' | 'lock' | 'unlock') => {
        if (selectedIds.length === 0) return;

        const config = {
            delete: {
                title: t('bulk_delete_title'),
                description: <>{t('bulk_delete_desc', { count: selectedIds.length })}</>,
                confirmText: t('bulk_delete_confirm'),
                variant: 'danger' as const,
                action: async () => {
                    for (const id of selectedIds) {
                        await fetch(`/api/vacancies/${id}`, { method: 'DELETE' });
                    }
                }
            },
            lock: {
                title: t('bulk_lock_title'),
                description: <>{t('bulk_lock_desc', { count: selectedIds.length })}</>,
                confirmText: t('bulk_lock_confirm'),
                variant: 'warning' as const,
                action: async () => {
                    for (const id of selectedIds) {
                        await fetch(`/api/vacancies/${id}/status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ situacao: 'Fechada' })
                        });
                    }
                }
            },
            unlock: {
                title: t('bulk_unlock_title'),
                description: <>{t('bulk_unlock_desc', { count: selectedIds.length })}</>,
                confirmText: t('bulk_unlock_confirm'),
                variant: 'success' as const,
                action: async () => {
                    for (const id of selectedIds) {
                        await fetch(`/api/vacancies/${id}/status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ situacao: 'Ativa' })
                        });
                    }
                }
            }
        }[type];

        setModal({
            ...config,
            isOpen: true,
            action: async () => {
                setIsActionLoading(true);
                try {
                    await config.action();
                    router.refresh();
                    setIsSelectionMode(false);
                    setSelectedIds([]);
                    setModal(null);
                } catch (e) {
                    console.error(e);
                    alert(t('error_bulk_action'));
                } finally {
                    setIsActionLoading(false);
                }
            }
        });
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('my_vacancies_title')}</h1>
                    <p className="text-gray-500">{t('my_vacancies_subtitle')}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={toggleSelectionMode}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer border ${isSelectionMode
                            ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {isSelectionMode ? <X size={18} /> : <CheckSquare size={18} />}
                        {isSelectionMode ? t('cancel_selection') : t('select')}
                    </button>
                    {!isSelectionMode && (
                        <Link
                            href="/company/vacancies/new"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            {t('publish_vacancy')}
                        </Link>
                    )}
                </div>
            </div>

            {isSelectionMode && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={selectAll}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                        >
                            {selectedIds.length > 0 && selectedIds.length === initialVacancies.filter(v => v.uuid).length ? <CheckSquare size={18} /> : <Square size={18} />}
                            {selectedIds.length > 0 && selectedIds.length === initialVacancies.filter(v => v.uuid).length ? t('deselect_all') : t('select_all')}
                        </button>
                        <span className="text-sm text-blue-600 font-medium">
                            {selectedIds.length} {selectedIds.length !== 1 ? t('selected_plural') : t('selected')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('unlock')}
                            disabled={selectedIds.length === 0 || isActionLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-600 border border-emerald-100 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <Unlock size={16} />
                            {t('management_open')}
                        </button>
                        <button
                            onClick={() => handleBulkAction('lock')}
                            disabled={selectedIds.length === 0 || isActionLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-amber-600 border border-amber-100 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <Ban size={16} />
                            {t('management_close')}
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            disabled={selectedIds.length === 0 || isActionLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <Trash2 size={16} />
                            {t('management_delete')}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {initialVacancies.map((vacancy) => (
                    <div key={vacancy.id} className="relative group">
                        {isSelectionMode && (
                            <div
                                onClick={() => vacancy.uuid && toggleSelectVacancy(vacancy.uuid)}
                                className={`absolute inset-0 z-10 rounded-xl cursor-pointer transition-all border-2 ${vacancy.uuid && selectedIds.includes(vacancy.uuid)
                                    ? 'bg-blue-600/5 border-blue-600'
                                    : 'bg-white/40 border-transparent hover:border-blue-200'
                                    }`}
                            >
                                <div className={`absolute top-4 right-4 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${vacancy.uuid && selectedIds.includes(vacancy.uuid)
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-300'
                                    }`}>
                                    {vacancy.uuid && selectedIds.includes(vacancy.uuid) && <Check size={16} />}
                                </div>
                            </div>
                        )}
                        <CompanyVacancyCard
                            vacancy={{
                                ...vacancy,
                                tipo_local_trabalho: vacancy.tipo_local_trabalho as any
                            }}
                            isSelectionMode={isSelectionMode}
                        />
                    </div>
                ))}
            </div>

            {/* Modal de Confirmação em Massa */}
            {modal?.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !isActionLoading && setModal(null)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0 ${modal.variant === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    modal.variant === 'danger' ? 'bg-red-50 text-red-600' :
                                        'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    <AlertCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{modal.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {modal.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => !isActionLoading && setModal(null)}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => !isActionLoading && setModal(null)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all cursor-pointer"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={modal.action}
                                    disabled={isActionLoading}
                                    className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50 ${modal.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
                                        modal.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' :
                                            'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
                                        }`}
                                >
                                    {isActionLoading ? t('processing') : modal.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
