"use client";

import { X, CheckCircle2, XCircle, Send, Sparkles, AlertTriangle, Wand2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    candidateId: string;
    onSubmit: (status: 'APPROVED' | 'REJECTED', justification: string) => Promise<void>;
    aiSuggestions?: string | string[] | { feedback: string; suggestions: string[] } | null;
}

interface FeedbackAnalysis {
    quality: number;
    acceptable: boolean;
    corrected: string | null;
    cause: string | null;
}

type SubmitStep = 'idle' | 'analyzing' | 'blocked' | 'ready' | 'submitting';

function QualityBadge({ quality }: { quality: number }) {
    const { t } = useTranslation();
    if (quality >= 50) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                {t('feedback_quality_great', 'Bom')} ({quality}/100)
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            <XCircle size={12} />
            {t('feedback_quality_poor', 'Ruim')} ({quality}/100)
        </span>
    );
}

export function FeedbackModal({ isOpen, onClose, candidateName, onSubmit, aiSuggestions }: FeedbackModalProps) {
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [justification, setJustification] = useState("");
    const [isPending, startTransition] = useTransition();
    const [aiSuggestionsUsed, setAiSuggestionsUsed] = useState(false);

    const [step, setStep] = useState<SubmitStep>('idle');
    const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStatus(null);
            setJustification("");
            setAiSuggestionsUsed(false);
            setStep('idle');
            setAnalysis(null);
            setAnalysisError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const resetAnalysis = () => {
        if (step !== 'idle' && step !== 'analyzing') {
            setStep('idle');
            setAnalysis(null);
            setAnalysisError(null);
        }
    };

    const generateAiMessage = (currentStatus: 'APPROVED' | 'REJECTED' | null) => {
        if (!aiSuggestions || !currentStatus) return '';

        let aiText = '';
        if (typeof aiSuggestions === 'object' && !Array.isArray(aiSuggestions) && 'feedback' in aiSuggestions) {
            aiText = aiSuggestions.feedback;
            if (aiSuggestions.suggestions?.length > 0) {
                aiText += `\n\n${t('feedback_ai_suggestion_intro', 'Sugestões de melhoria:')}\n`;
                aiText += aiSuggestions.suggestions.map(s => `- ${s}`).join('\n');
            }
        } else if (Array.isArray(aiSuggestions)) {
            aiText = `${t('feedback_ai_suggestion_intro', 'Sugestões de melhoria:')}\n`;
            aiText += aiSuggestions.map(s => `- ${s}`).join('\n');
        } else if (typeof aiSuggestions === 'string') {
            aiText = aiSuggestions;
        }

        if (currentStatus === 'APPROVED') {
            const intro = t('feedback_approved_intro', 'Olá! Segue abaixo seu feedback: \n\nVocê parece se enquadrar ao perfil da vaga. Achamos seu perfil interessante e, por isso, você está aprovado para a próxima etapa do processo seletivo.');
            const closing = t('feedback_approved_closing', 'Fique atento para o início da próxima etapa. Boa sorte!');
            return `${intro}\n\n${aiText}\n\n${closing}`;
        } else {
            const intro = t('feedback_rejected_intro', 'Olá! Segue abaixo seu feedback: \n\nAgradecemos seu interesse em fazer parte da nossa equipe e o tempo dedicado ao processo seletivo. Entretanto, infelizmente você não foi selecionado para a próxima etapa do processo seletivo.');
            const closing = t('feedback_rejected_closing', 'Desejamos sucesso em sua jornada profissional e esperamos que surjam novas oportunidades no futuro.');
            return `${intro}\n\n${aiText}\n\n${closing}`;
        }
    };

    useEffect(() => {
        if (aiSuggestionsUsed && status) {
            setJustification(generateAiMessage(status));
        }
    }, [status, aiSuggestionsUsed]);

    const handleAnalyze = async () => {
        if (!status) {
            toast.error(t('feedback_select_status_error', 'Selecione um status'));
            return;
        }
        if (!justification.trim() || justification.length < 40) {
            toast.error(t('feedback_min_length_error'));
            return;
        }

        setStep('analyzing');
        setAnalysis(null);
        setAnalysisError(null);

        try {
            const res = await fetch('/api/ai/check-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: 'company', feedback: justification, language: i18n.language.split('-')[0] }),
            });

            if (!res.ok) throw new Error(`AI service error: ${res.status}`);

            const data: FeedbackAnalysis = await res.json();
            setAnalysis(data);
            setStep(data.acceptable ? 'ready' : 'blocked');
        } catch (err) {
            console.error('Feedback analysis error:', err);
            setAnalysisError(t('feedback_analysis_error', 'Não foi possível analisar o feedback. Tente novamente.'));
            setStep('idle');
        }
    };

    const handleConfirmSubmit = () => {
        if (!status || step !== 'ready') return;

        setStep('submitting');
        startTransition(async () => {
            try {
                await onSubmit(status, justification);
                toast.success(t('feedback_success'));
                onClose();
            } catch {
                toast.error(t('feedback_error'));
                setStep('ready');
            }
        });
    };

    const handleUseAiSuggestions = () => {
        if (!aiSuggestions || !status) return;
        setJustification(generateAiMessage(status));
        setAiSuggestionsUsed(true);
        resetAnalysis();
    };

    const handleUseCorrectedText = () => {
        if (!analysis?.corrected) return;
        setJustification(analysis.corrected);
        setStep('idle');
        setAnalysis(null);
        setAnalysisError(null);
    };

    if (!isOpen) return null;

    const isAnalyzing = step === 'analyzing';
    const isBusy = isAnalyzing || step === 'submitting';
    const canEdit = !isBusy;
    const primaryButton = (() => {
        if (step === 'idle') return { label: t('feedback_analyze_button', 'Verificar com IA'), action: handleAnalyze };
        if (step === 'analyzing') return { label: t('feedback_analyzing_short', 'Verificando...'), action: () => {} };
        if (step === 'blocked') return { label: t('feedback_blocked_button', 'Corrija o feedback'), action: () => {} };
        if (step === 'ready') return { label: t('feedback_confirm_submit', 'Confirmar e Enviar'), action: handleConfirmSubmit };
        if (step === 'submitting') return { label: t('feedback_sending', 'Enviando...'), action: () => {} };
        return { label: t('feedback_submit', 'Enviar Feedback'), action: handleAnalyze };
    })();

    const isSubmitDisabled =
        !status ||
        justification.length < 40 ||
        isBusy ||
        step === 'blocked';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{t('feedback_modal_title', 'Enviar Feedback')}</h2>
                        <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher align="right" />
                        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer" disabled={isBusy}>
                            <X size={24} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            {t('feedback_decision_label', 'Decisão')}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => { setStatus('APPROVED'); resetAnalysis(); }}
                                disabled={isBusy}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${status === 'APPROVED'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <CheckCircle2 size={32} className={status === 'APPROVED' ? 'text-green-600' : 'text-gray-400'} />
                                <span className="mt-2 font-bold">{t('feedback_approve', 'Aprovar')}</span>
                            </button>

                            <button
                                onClick={() => { setStatus('REJECTED'); resetAnalysis(); }}
                                disabled={isBusy}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${status === 'REJECTED'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50 text-gray-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                    disabled={!status || isBusy}
                                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${!status || isBusy
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
                                if (aiSuggestionsUsed) setAiSuggestionsUsed(false);
                                resetAnalysis();
                            }}
                            disabled={!status || !canEdit}
                            placeholder={
                                !status
                                    ? t('feedback_select_status_first', 'Selecione um status primeiro')
                                    : t('feedback_justification_placeholder', 'Escreva uma mensagem para o candidato...')
                            }
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none resize-none h-40 text-sm transition-colors
                                ${!status || !canEdit
                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400'
                                    : step === 'blocked'
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : step === 'ready'
                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                                            : justification.length > 0 && justification.length < 40
                                                ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-200'
                                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                        />
                        <div className="flex justify-between items-center mt-1.5">
                            <div>
                                {analysis && <QualityBadge quality={analysis.quality} />}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${justification.length > 0 && justification.length < 40 ? 'text-amber-500' : 'text-gray-400'}`}>
                                {justification.length} / 40 {t('feedback_chars', 'caracteres')}
                            </span>
                        </div>
                    </div>

                    {isAnalyzing && (
                        <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin shrink-0" />
                            {t('feedback_analyzing', 'Analisando feedback com IA...')}
                        </div>
                    )}

                    {analysisError && (
                        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            {analysisError}
                        </div>
                    )}

                    {step === 'blocked' && analysis && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-700">
                                        {t('feedback_unacceptable_title', 'Feedback não pode ser enviado')}
                                    </p>
                                    {analysis.cause && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {(() => {
                                                switch (analysis.cause.toLowerCase()) {
                                                    case 'short':
                                                        return t('feedback_cause_short', 'Motivo: Texto muito curto.');
                                                    case 'agressive':
                                                    case 'aggressive':
                                                        return t('feedback_cause_agressive', 'Motivo: texto agressivo ou ofensivo.');
                                                    case 'unknown':
                                                        return t('feedback_cause_unknown', 'Motivo: Texto não aceitável como feedback.');
                                                    case 'language':
                                                        return t('feedback_cause_language', 'Motivo: Texto com linguagem inaceitável.');
                                                    case 'nosense':
                                                    case 'nonsense':
                                                        return t('feedback_cause_nosense', 'Motivo: Texto sem sentido para um feedback.');
                                                    default:
                                                        return `${t('feedback_cause_default', 'Motivo:')} ${analysis.cause}`;
                                                }
                                            })()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'ready' && analysis && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-700">
                                        {t('feedback_acceptable_title', 'Feedback aprovado pela IA')}
                                    </p>
                                    <p className="text-xs text-green-600 mt-0.5">
                                        {t('feedback_ready_to_send', 'Clique em "Confirmar e Enviar" para finalizar.')}
                                    </p>
                                </div>
                            </div>

                            {analysis.corrected && analysis.corrected.trim() !== justification.trim() && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-green-700">
                                        {t('feedback_corrected_optional', 'Versão melhorada pela IA (opcional):')}
                                    </p>
                                    <div className="text-xs text-gray-700 bg-white border border-green-100 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                                        {analysis.corrected}
                                    </div>
                                    <button
                                        onClick={handleUseCorrectedText}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                                    >
                                        <Wand2 size={12} />
                                        {t('feedback_use_suggested', 'Usar texto sugerido')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isBusy}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {t('feedback_cancel', 'Cancelar')}
                    </button>

                    <button
                        onClick={primaryButton.action}
                        disabled={isSubmitDisabled}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                            step === 'ready'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {(isAnalyzing || step === 'submitting') && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {step === 'idle' && <Sparkles size={16} />}
                        {step === 'ready' && <Send size={16} />}
                        {primaryButton.label}
                    </button>
                </div>
            </div>
        </div>
    );
}
