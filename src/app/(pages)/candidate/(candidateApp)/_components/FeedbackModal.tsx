"use client";

import React from 'react';
import { X, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: {
        status: 'APPROVED' | 'REJECTED';
        justification: string;
        vacancyTitle: string;
        companyName: string;
        date: Date;
    } | null;
}

export function FeedbackModal({ isOpen, onClose, feedback }: FeedbackModalProps) {
    const { t, i18n } = useTranslation();

    if (!isOpen || !feedback) return null;

    const isApproved = feedback.status === 'APPROVED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header */}
                <div className={`p-6 border-b ${isApproved ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isApproved ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                {isApproved ? (
                                    <CheckCircle size={24} className="text-green-600" />
                                ) : (
                                    <XCircle size={24} className="text-red-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                    {isApproved ? t('notifications.types.feedback_approved.title') : t('notifications.types.feedback_rejected.title')}
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {feedback.vacancyTitle} • {feedback.companyName}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(feedback.date).toLocaleDateString(
                                        i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'),
                                        {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            aria-label={t('feedback_modal_close')}
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare size={18} className="text-indigo-600" />
                            <h3 className="font-semibold text-slate-800">{t('feedback_modal_company_message')}</h3>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {feedback.justification || t('feedback_modal_no_message')}
                            </p>
                        </div>
                    </div>

                    {isApproved && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-4">
                            <p className="text-sm text-green-800">
                                <strong>{t('feedback_modal_next_steps_title')}</strong> {t('feedback_modal_next_steps_desc')}
                            </p>
                        </div>
                    )}

                    {!isApproved && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                            <p className="text-sm text-blue-800">
                                <strong>{t('feedback_modal_keep_trying_title')}</strong> {t('feedback_modal_keep_trying_desc')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        {t('feedback_modal_close')}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
