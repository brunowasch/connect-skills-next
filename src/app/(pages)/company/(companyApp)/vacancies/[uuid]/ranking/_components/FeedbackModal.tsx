"use client";

import { X, CheckCircle2, XCircle, Send, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    candidateId: string;

    onSubmit: (status: 'APPROVED' | 'REJECTED', justification: string) => Promise<void>;
    aiSuggestions?: string | string[] | { feedback: string; suggestions: string[] } | null;
}

export function FeedbackModal({ isOpen, onClose, candidateName, onSubmit, aiSuggestions }: FeedbackModalProps) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [justification, setJustification] = useState("");
    const [isPending, startTransition] = useTransition();
    const [aiSuggestionsUsed, setAiSuggestionsUsed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStatus(null);
            setJustification("");
            setAiSuggestionsUsed(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const generateAiMessage = (currentStatus: 'APPROVED' | 'REJECTED' | null) => {
        if (!aiSuggestions || !currentStatus) return '';

        let aiText = '';

        if (typeof aiSuggestions === 'object' && !Array.isArray(aiSuggestions) && 'feedback' in aiSuggestions) {
            aiText = aiSuggestions.feedback;

            if (aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0) {
                aiText += `\n\n${t('feedback_ai_suggestion_intro', 'Sugestões de melhoria:')}\n`;
                aiText += aiSuggestions.suggestions.map(s => `- ${s}`).join('\n');
            }
        }
        else if (Array.isArray(aiSuggestions)) {
            aiText = `${t('feedback_ai_suggestion_intro', 'Sugestões de melhoria:')}\n`;
            aiText += aiSuggestions.map(s => `- ${s}`).join('\n');
        }
        else if (typeof aiSuggestions === 'string') {
            aiText = aiSuggestions;
        }

        let fullMessage = '';

        if (currentStatus === 'APPROVED') {
            const intro = t('feedback_approved_intro', 'Olá! Segue abaixo seu feedback: \n\nVocê parece se enquadrar ao perfil da vaga. Achamos seu perfil interessante e, por isso, você está aprovado para a próxima etapa do processo seletivo.');
            const closing = t('feedback_approved_closing', 'Fique atento para o início da próxima etapa. Boa sorte!');
            fullMessage = `${intro}\n\n${aiText}\n\n${closing}`;
        } else if (currentStatus === 'REJECTED') {
            const intro = t('feedback_rejected_intro', 'Olá! Segue abaixo seu feedback: \n\nAgradecemos seu interesse em fazer parte da nossa equipe e o tempo dedicado ao processo seletivo. Entretanto, infelizmente você não foi selecionado para a próxima etapa do processo seletivo.');
            const closing = t('feedback_rejected_closing', 'Desejamos sucesso em sua jornada profissional e esperamos que surjam novas oportunidades no futuro.');
            fullMessage = `${intro}\n\n${aiText}\n\n${closing}`;
        } else {
            fullMessage = aiText;
        }

        return fullMessage;
    };

    useEffect(() => {
        if (aiSuggestionsUsed && status) {
            const newMessage = generateAiMessage(status);
            setJustification(newMessage);
        }
    }, [status, aiSuggestionsUsed]);

    const handleSubmit = () => {
        if (!status) {
            toast.error(t('feedback_select_status_error', 'Selecione um status'));
            return;
        }

        if (!justification.trim() || justification.length < 40) {
            toast.error(t('feedback_min_length_error'));
            return;
        }

        startTransition(async () => {
            try {
                await onSubmit(status, justification);
                toast.success(t('feedback_success'));
                onClose();
            } catch (error) {
                toast.error(t('feedback_error'));
            }
        });
    };

    const handleUseAiSuggestions = () => {
        if (!aiSuggestions || !status) return;

        const fullMessage = generateAiMessage(status);
        setJustification(fullMessage);
        setAiSuggestionsUsed(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('feedback_modal_title', 'Enviar Feedback')}</h2>
                        <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                        disabled={isPending}
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            {t('feedback_decision_label', 'Decisão')}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setStatus('APPROVED')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${status === 'APPROVED'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-600'
                                    }`}
                            >
                                <CheckCircle2 size={32} className={status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'} />
                                <span className="mt-2 font-bold">{t('feedback_approve', 'Aprovar')}</span>
                            </button>

                            <button
                                onClick={() => setStatus('REJECTED')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${status === 'REJECTED'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50 text-gray-600'
                                    }`}
                            >
                                <XCircle size={32} className={status === 'REJECTED' ? 'text-red-600' : 'text-gray-400'} />
                                <span className="mt-2 font-bold">{t('feedback_reject', 'Reprovar')}</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                {t('feedback_justification_label', 'Justificativa')} <span className="text-red-500">*</span>
                            </label>
                            {aiSuggestions && (
                                <button
                                    onClick={handleUseAiSuggestions}
                                    disabled={!status}
                                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${!status
                                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                                        : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 cursor-pointer'
                                        }`}
                                    title={!status ? t('feedback_select_status_first', 'Selecione um status primeiro') : t('feedback_use_ai_tooltip', 'Inserir sugestões da IA')}
                                >
                                    <Sparkles size={14} />
                                    {t('feedback_use_ai', 'Usar sugestões da IA')}
                                </button>
                            )}
                        </div>
                        <textarea
                            value={justification}
                            onChange={(e) => {
                                setJustification(e.target.value);
                                // If user manually edits the text, disable automatic updates
                                if (aiSuggestionsUsed) {
                                    setAiSuggestionsUsed(false);
                                }
                            }}
                            disabled={!status}
                            placeholder={!status ? t('feedback_select_status_first', 'Selecione um status primeiro') : t('feedback_justification_placeholder', 'Escreva uma mensagem para o candidato...')}
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none resize-none h-64 text-sm transition-colors
                                ${!status
                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400'
                                    : justification.length > 0 && justification.length < 40
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
                        />
                        <div className="flex justify-end mt-1">
                            <span className={`text-xs font-medium transition-colors ${justification.length > 0 && justification.length < 40 ? 'text-red-500' : 'text-gray-400'}`}>
                                {justification.length} / 40
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        {t('feedback_cancel', 'Cancelar')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!status || justification.length < 40 || isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('feedback_sending', 'Enviando...')}
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                {t('feedback_submit', 'Enviar Feedback')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
