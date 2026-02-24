import { useState } from "react";
import { X, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { rewriteVacancyAI } from "@/src/app/actions/rewriteVacancyAI";

interface AIRewriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldText: string;
    onRewrite: (newText: string) => void;
}

export function AIRewriteModal({ isOpen, onClose, oldText, onRewrite }: AIRewriteModalProps) {
    const { t } = useTranslation();
    const [reqChanges, setReqChanges] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleRewrite = async () => {
        if (!reqChanges.trim()) return;
        setIsLoading(true);
        try {
            const result = await rewriteVacancyAI({
                old_text: oldText,
                req_changes: reqChanges
            });
            onRewrite(result.new_text);
            onClose();
            setReqChanges("");
        } catch (error) {
            console.error(error);
            alert(t('ai_error_rewriting', 'Erro ao reescrever texto. Tente novamente.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Sparkles size={24} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">
                                {t('ai_rewrite_title', 'Reescrever com IA')}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-all cursor-pointer group"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Explication */}
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

                {/* Footer */}
                <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
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
            </div>
        </div>
    );
}
