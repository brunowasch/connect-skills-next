"use client";

import { X, Brain, Loader2, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    breakdown: string | null | undefined;
    score: number;
}

interface BreakdownData {
    score_D?: number;
    score_I?: number;
    score_S?: number;
    score_C?: number;
    compatible_skills?: string[];
    ai_comment?: string;
}

export function AnalysisModal({ isOpen, onClose, candidateName, breakdown, score }: AnalysisModalProps) {
    const [analysisData, setAnalysisData] = useState<BreakdownData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            loadAnalysis();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, breakdown]);

    const loadAnalysis = () => {
        setIsLoading(true);
        try {
            if (breakdown) {
                const parsed = JSON.parse(breakdown);
                setAnalysisData(parsed);
            }
        } catch (e) {
            console.error("Failed to parse breakdown");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const discScores = [
        { label: 'Dominância (D)', value: analysisData?.score_D || 0, color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
        { label: 'Influência (I)', value: analysisData?.score_I || 0, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
        { label: 'Estabilidade (S)', value: analysisData?.score_S || 0, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
        { label: 'Conformidade (C)', value: analysisData?.score_C || 0, color: 'bg-orange-500', bgLight: 'bg-orange-50', textColor: 'text-orange-700' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Análise da IA</h2>
                            <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Overall Score */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <Award className="text-blue-600" size={24} />
                                    <h3 className="text-lg font-bold text-slate-900">Score Geral</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl font-bold text-blue-600">{score}%</div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DISC Scores */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="text-purple-600" size={20} />
                                    <h3 className="text-lg font-bold text-slate-900">Perfil DISC</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {discScores.map((disc) => (
                                        <div key={disc.label} className={`${disc.bgLight} rounded-xl p-4 border border-gray-100`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-semibold ${disc.textColor}`}>{disc.label}</span>
                                                <span className={`text-2xl font-bold ${disc.textColor}`}>{disc.value}</span>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full ${disc.color} transition-all`}
                                                    style={{ width: `${disc.value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compatible Skills */}
                            {analysisData?.compatible_skills && analysisData.compatible_skills.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">Habilidades Compatíveis</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisData.compatible_skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Comment */}
                            {analysisData?.ai_comment && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <Brain className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">Comentário da IA</h3>
                                            <p className="text-gray-700 leading-relaxed">{analysisData.ai_comment}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!analysisData && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Análise não disponível para este candidato.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
