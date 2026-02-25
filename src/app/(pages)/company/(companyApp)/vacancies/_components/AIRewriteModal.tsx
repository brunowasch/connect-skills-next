import { useState, useMemo } from "react";
import { X, Sparkles, Loader2, ArrowRight, Check, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { rewriteVacancyAI } from "@/src/app/actions/rewriteVacancyAI";

interface AIRewriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldText: string;
    onRewrite: (newText: string) => void;
}

interface DiffPart {
    type: 'added' | 'removed' | 'kept';
    text: string;
}

function computeDiff(oldStr: string, newStr: string): DiffPart[] {
    const s1 = String(oldStr || "");
    const s2 = String(newStr || "");
    const oldWords = s1.split(/(\s+)/).filter(Boolean);
    const newWords = s2.split(/(\s+)/).filter(Boolean);

    const diff: DiffPart[] = [];
    let i = 0, j = 0;

    while (i < oldWords.length && j < newWords.length) {
        if (oldWords[i] === newWords[j]) {
            diff.push({ type: 'kept', text: oldWords[i] });
            i++; j++;
        } else {
            let foundMatch = false;
            for (let k = 1; k < 5; k++) {
                if (i + k < oldWords.length && oldWords[i + k] === newWords[j]) {
                    for (let m = 0; m < k; m++) {
                        diff.push({ type: 'removed', text: oldWords[i + m] });
                    }
                    i += k;
                    foundMatch = true;
                    break;
                }
                if (j + k < newWords.length && oldWords[i] === newWords[j + k]) {
                    for (let m = 0; m < k; m++) {
                        diff.push({ type: 'added', text: newWords[j + m] });
                    }
                    j += k;
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch) {
                diff.push({ type: 'removed', text: oldWords[i] });
                diff.push({ type: 'added', text: newWords[j] });
                i++; j++;
            }
        }
    }

    while (i < oldWords.length) {
        diff.push({ type: 'removed', text: oldWords[i++] });
    }
    while (j < newWords.length) {
        diff.push({ type: 'added', text: newWords[j++] });
    }

    return diff;
}

export function AIRewriteModal({ isOpen, onClose, oldText, onRewrite }: AIRewriteModalProps) {
    const { t } = useTranslation();
    const [reqChanges, setReqChanges] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [rewrittenText, setRewrittenText] = useState("");

    const diffParts = useMemo(() => {
        if (step === 'review' && rewrittenText) {
            return computeDiff(oldText, rewrittenText);
        }
        return [];
    }, [oldText, rewrittenText, step]);

    if (!isOpen) return null;

    const handleRewrite = async () => {
        if (!reqChanges.trim()) return;
        setIsLoading(true);
        try {
            const result = await rewriteVacancyAI({
                old_text: oldText,
                req_changes: reqChanges
            });
            setRewrittenText(result.new_text);
            setStep('review');
        } catch (error) {
            console.error(error);
            alert(t('ai_error_rewriting', 'Erro ao reescrever texto. Tente novamente.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevert = () => {
        handleClose();
    };

    const handleConfirm = () => {
        onRewrite(rewrittenText);
        handleClose();
    };

    const handleClose = () => {
        setReqChanges("");
        setRewrittenText("");
        setStep('input');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Sparkles size={24} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">
                                {step === 'input' ? t('ai_rewrite_title', 'Reescrever com IA') : t('ai_comparison_title', 'Comparação de Alterações')}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-all cursor-pointer group"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    {step === 'input' ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Explanation */}
                            <p className="text-gray-500 text-sm leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                {t('ai_rewrite_description', 'Nossa IA ajudará a aperfeiçoar seu texto baseado no que você deseja alterar. Mantenha o que está bom e mude apenas o necessário.')}
                            </p>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Current Text (Read Only) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                        {t('ai_current_text_label', 'Texto atual')}
                                    </label>
                                    <div className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-600 text-sm max-h-[180px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                        {oldText || <span className="italic text-gray-400">{t('ai_no_text_provided', 'Nenhum texto fornecido')}</span>}
                                    </div>
                                </div>

                                {/* Request Changes */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        {t('ai_changes_label', 'O que você quer modificar no texto?')}
                                    </label>
                                    <textarea
                                        value={reqChanges}
                                        onChange={(e) => setReqChanges(e.target.value)}
                                        placeholder={t('ai_changes_placeholder', 'Ex: Torne o texto mais formal, adicione informações sobre benefícios, remova termos técnicos...')}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all min-h-[120px] resize-none text-sm placeholder:text-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Comparison View */}
                            <p className="text-gray-500 text-sm leading-relaxed bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
                                {t('ai_comparison_desc', 'Veja abaixo o que foi alterado. O texto em verde foi adicionado e o riscado foi removido.')}
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                {/* Side by Side - Original */}
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                        {t('ai_current_text_label', 'Texto atual')}
                                    </label>
                                    <div className="flex-1 w-full px-6 py-6 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 text-sm leading-relaxed shadow-inner overflow-y-auto max-h-[400px]">
                                        <div className="whitespace-pre-wrap">
                                            {oldText}
                                        </div>
                                    </div>
                                </div>

                                {/* Side by Side - Suggested */}
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Sugestão da IA
                                    </label>
                                    <div className="flex-1 w-full px-6 py-6 rounded-2xl bg-white border-2 border-blue-100 text-gray-700 text-sm leading-relaxed shadow-sm overflow-y-auto max-h-[400px]">
                                        <div className="whitespace-pre-wrap">
                                            {diffParts.map((part, idx) => {
                                                if (part.type === 'added') {
                                                    return <span key={idx} className="bg-green-100 text-green-800 px-0.5 rounded font-medium border-b border-green-200">{part.text}</span>;
                                                }
                                                if (part.type === 'removed') {
                                                    return <span key={idx} className="text-red-300 line-through decoration-red-300/50 text-[12px] opacity-60 px-0.5">{part.text}</span>;
                                                }
                                                return <span key={idx}>{part.text}</span>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
                    {step === 'input' ? (
                        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
                            <button
                                onClick={handleClose}
                                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleRewrite}
                                disabled={isLoading || !reqChanges.trim() || !oldText}
                                className="group px-8 py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center gap-3 transition-all active:scale-95 cursor-pointer"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Sparkles size={18} />
                                )}
                                <span>
                                    {isLoading ? t('ai_rewriting_btn', 'Reescrevendo...') : t('ai_rewrite_btn', 'Reescrever Texto')}
                                </span>
                                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleRevert}
                                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer hover:bg-red-50 rounded-xl"
                            >
                                <RotateCcw size={16} />
                                {t('ai_revert_changes', 'Rejeitar Alterações')}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex items-center gap-2 px-8 py-3 text-sm font-bold bg-green-600 text-white rounded-2xl hover:bg-green-700 hover:shadow-[0_10px_20px_-10px_rgba(22,163,74,0.4)] transition-all active:scale-95 cursor-pointer"
                            >
                                <Check size={18} />
                                {t('ai_confirm_changes', 'Manter Alterações')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
