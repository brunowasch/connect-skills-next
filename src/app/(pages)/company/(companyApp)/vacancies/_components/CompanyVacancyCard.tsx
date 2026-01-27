"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectVacancyForRanking, selectVacancyForEditing } from "../actions";
import { AlertCircle, X, Lock, Unlock, Ban, Eye, Edit, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface CompanyVacancy {
    id: string;
    uuid?: string | null;
    cargo: string;
    tipo_local_trabalho: 'Presencial' | 'Home_Office' | 'H_brido';
    created_at: Date;
    status: string;
    _count?: {
        vaga_avaliacao?: number;
    };
}

interface ModalConfig {
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    confirmText: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
}

export function CompanyVacancyCard({
    vacancy,
    isSelectionMode = false
}: {
    vacancy: CompanyVacancy,
    isSelectionMode?: boolean
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isUpdating, setIsUpdating] = useState(false);
    const [modal, setModal] = useState<ModalConfig>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
        confirmText: '',
        variant: 'info'
    });

    const tipoMap: Record<string, string> = {
        Presencial: t('Presencial'),
        Home_Office: t('Home Office'),
        H_brido: t('Híbrido'),
    };

    const applicationCount = vacancy._count?.vaga_avaliacao || 0;
    const statusLabel = vacancy.status === 'Ativa' ? t('active') : t('inactive');

    const handleToggleStatus = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const isClosing = vacancy.status === 'Ativa';
        const newStatus = isClosing ? 'Fechada' : 'Ativa';

        setModal({
            isOpen: true,
            title: isClosing ? t('lock_vacancy') : t('unlock_vacancy'),
            description: isClosing
                ? <>{t('lock_vacancy_desc', { cargo: vacancy.cargo })}</>
                : <>{t('unlock_vacancy_desc', { cargo: vacancy.cargo })}</>,
            confirmText: isClosing ? t('lock_vacancy') : t('unlock_vacancy'),
            variant: isClosing ? 'warning' : 'success',
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    const res = await fetch(`/api/vacancies/${vacancy.id}/status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ situacao: newStatus })
                    });

                    if (res.ok) {
                        router.refresh();
                        setModal(prev => ({ ...prev, isOpen: false }));
                    } else {
                        alert(t('error_updating_status'));
                    }
                } catch (e) {
                    console.error(e);
                    alert(t('error_connection'));
                } finally {
                    setIsUpdating(false);
                }
            }
        });
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200 relative">
            {/* Card clicável para ver detalhes */}
            <Link
                href={`/viewer/vacancy/${vacancy.uuid}`}
                className="block p-5 pb-4"
            >
                <div className="mb-4">
                    <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-900 transition-colors group-hover:text-blue-600 flex-1">
                            {vacancy.cargo}
                        </h3>
                        {!isSelectionMode && (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${vacancy.status === 'Ativa'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {statusLabel}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {isSelectionMode && (
                            <div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block ${vacancy.status === 'Ativa'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {statusLabel}
                                </span>
                            </div>
                        )}
                        <div className="text-sm text-gray-500">
                            {tipoMap[vacancy.tipo_local_trabalho]} • {t('created_at_label')} {vacancy.created_at.toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <span>
                            <span className="font-semibold text-slate-900">{applicationCount}</span> {t('candidates')}
                        </span>
                    </div>
                </div>
            </Link>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-4 py-4 md:px-5 md:py-5 pt-3 border-t border-gray-50">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        startTransition(() => selectVacancyForRanking(vacancy.id));
                    }}
                    className="w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-2 h-10 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-100 transition-colors whitespace-nowrap order-1 sm:order-none"
                >
                    <Users size={16} />
                    {t('view_candidates_btn')}
                </button>
                <Link
                    href={`/viewer/vacancy/${vacancy.uuid}`}
                    className="w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-2 h-10 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-100 transition-colors whitespace-nowrap order-2 sm:order-none"
                >
                    <Eye size={16} />
                    {t('view_vacancy_btn')}
                </Link>

                <div className="flex gap-2 w-full sm:w-auto order-3 sm:order-none">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            startTransition(() => selectVacancyForEditing(vacancy.id));
                        }}
                        className="flex-1 sm:flex-none flex shrink-0 items-center justify-center w-full sm:w-10 h-10 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                        title={t('edit_vacancy_btn')}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={handleToggleStatus}
                        disabled={isUpdating}
                        className={`flex-1 sm:flex-none flex shrink-0 items-center justify-center w-full sm:w-10 h-10 rounded-lg transition-colors border cursor-pointer disabled:opacity-50 ${vacancy.status === 'Ativa'
                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 border-gray-200'
                            : 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100'
                            }`}
                        title={vacancy.status === 'Ativa' ? t('lock_vacancy') : t('unlock_vacancy')}
                    >
                        {vacancy.status === 'Ativa' ? <Ban size={16} /> : <Unlock size={16} />}
                    </button>
                </div>
            </div>

            {/* Modal de Confirmação */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                    />

                    {/* Modal Card */}
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0 ${modal.variant === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    modal.variant === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-blue-50 text-blue-600'
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
                                    onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all cursor-pointer"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={modal.onConfirm}
                                    disabled={isUpdating}
                                    className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50 ${modal.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
                                        modal.variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' :
                                            'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                        }`}
                                >
                                    {isUpdating ? t('processing') : modal.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
