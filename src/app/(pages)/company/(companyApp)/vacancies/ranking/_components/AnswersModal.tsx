"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface AnswersModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    answers: string | null | undefined;
}

export function AnswersModal({ isOpen, onClose, candidateName, answers }: AnswersModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    let parsedAnswers: any = null;
    try {
        parsedAnswers = answers ? JSON.parse(answers) : null;
    } catch (e) {
        console.error("Failed to parse answers");
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Respostas do Candidato</h2>
                        <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {!parsedAnswers ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Nenhum dado de resposta encontrado.</p>
                        </div>
                    ) : (() => {
                        const responses = Array.isArray(parsedAnswers) ? parsedAnswers : parsedAnswers.responses;
                        const metrics = parsedAnswers.metrics;

                        if (!responses || !Array.isArray(responses) || responses.length === 0) {
                            return (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Nenhuma resposta disponível para este candidato.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-8">
                                {/* Metrics Summary */}
                                {metrics && (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider text-blue-300">Duração do Teste</p>
                                            <p className="text-lg font-bold">
                                                {Math.floor(metrics.duration / 60)}m {metrics.duration % 60}s
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider text-amber-300">Saídas da Tela</p>
                                            <p className={`text-lg font-bold ${metrics.penalties > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {metrics.penalties} {metrics.penalties === 1 ? 'vez' : 'vezes'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {responses.map((resp: any, index: number) => (
                                        <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-slate-100">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 mb-3 leading-snug">{resp.question || "Pergunta sem título"}</h3>
                                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{resp.answer || "Sem resposta."}</p>
                                                    </div>
                                                    {(resp.category || resp.method) && (
                                                        <div className="mt-4 flex gap-2">
                                                            {resp.category && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-100 text-slate-500">
                                                                    {resp.category}
                                                                </span>
                                                            )}
                                                            {resp.method && resp.method !== "N/A" && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-blue-50 text-blue-500">
                                                                    {resp.method}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
