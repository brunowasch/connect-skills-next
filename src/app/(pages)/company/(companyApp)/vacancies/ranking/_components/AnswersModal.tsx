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
                            <p className="text-gray-500">Nenhuma resposta disponível.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(parsedAnswers).map(([key, value]: [string, any], index) => (
                                <div key={key} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 mb-2">{value.question || `Questão ${index + 1}`}</h3>
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                <p className="text-gray-700">{value.answer || value}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
