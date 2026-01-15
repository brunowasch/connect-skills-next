"use client";

import { useState } from "react";
import { Mail, FileText, Brain, User } from "lucide-react";
import { AnswersModal } from "./AnswersModal";
import { AnalysisModal } from "./AnalysisModal";

interface Application {
    id: string;
    score: number;
    created_at: Date;
    breakdown?: string | null;
    resposta?: string | null;
}

interface Candidate {
    id: string;
    nome: string | null;
    sobrenome: string | null;
    cidade: string | null;
    estado: string | null;
    foto_perfil: string | null;
    usuario?: {
        email: string;
        avatarUrl: string | null;
    } | null;
    application?: Application;
}

interface RankingListProps {
    candidates: Candidate[];
    vacancyId: string;
}

type SortOption = 'score' | 'score_D' | 'score_I' | 'score_S' | 'score_C';

export function RankingList({ candidates, vacancyId }: RankingListProps) {
    const [sortBy, setSortBy] = useState<SortOption>('score');
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Parse breakdown to extract DISC scores
    const parseBreakdown = (breakdown: string | null | undefined) => {
        if (!breakdown) return { D: 0, I: 0, S: 0, C: 0 };

        try {
            const parsed = JSON.parse(breakdown);
            return {
                D: parsed.score_D || 0,
                I: parsed.score_I || 0,
                S: parsed.score_S || 0,
                C: parsed.score_C || 0,
            };
        } catch {
            return { D: 0, I: 0, S: 0, C: 0 };
        }
    };

    // Sort candidates based on selected criteria
    const sortedCandidates = [...candidates].sort((a, b) => {
        if (sortBy === 'score') {
            const scoreA = a.application?.score || 0;
            const scoreB = b.application?.score || 0;
            if (scoreB !== scoreA) return scoreB - scoreA;
            // Tie-breaker: earlier application
            return new Date(a.application?.created_at || 0).getTime() - new Date(b.application?.created_at || 0).getTime();
        } else {
            const breakdownA = parseBreakdown(a.application?.breakdown);
            const breakdownB = parseBreakdown(b.application?.breakdown);
            const key = sortBy.replace('score_', '') as 'D' | 'I' | 'S' | 'C';
            const scoreA = breakdownA[key];
            const scoreB = breakdownB[key];
            if (scoreB !== scoreA) return scoreB - scoreA;
            // Tie-breaker: earlier application
            return new Date(a.application?.created_at || 0).getTime() - new Date(b.application?.created_at || 0).getTime();
        }
    });

    const handleShowAnswers = (candidateId: string) => {
        setSelectedCandidate(candidateId);
        setShowAnswers(true);
        setShowAnalysis(false);
    };

    const handleShowAnalysis = (candidateId: string) => {
        setSelectedCandidate(candidateId);
        setShowAnalysis(true);
        setShowAnswers(false);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                    </div>
                    <div>
                        <label htmlFor="ordenarPor" className="text-sm font-semibold text-gray-700 block">Ordenar candidatos por:</label>
                        <p className="text-xs text-gray-500">Escolha o critério de ranqueamento</p>
                    </div>
                </div>
                <select
                    id="ordenarPor"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2.5 border-2 border-blue-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
                >
                    <option value="score">Score Geral</option>
                    <option value="score_D">Dominância (D)</option>
                    <option value="score_I">Influência (I)</option>
                    <option value="score_S">Estabilidade (S)</option>
                    <option value="score_C">Conformidade (C)</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sortedCandidates.map((candidate, index) => {
                    const breakdown = parseBreakdown(candidate.application?.breakdown);

                    return (
                        <div key={candidate.id} className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

                            {/* Ranking Badge */}
                            <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm z-10">
                                #{index + 1}
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 ml-2">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0 border border-blue-200">
                                        {candidate.foto_perfil || candidate.usuario?.avatarUrl ? (
                                            <img src={candidate.foto_perfil || candidate.usuario?.avatarUrl!} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-blue-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{candidate.nome} {candidate.sobrenome}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                            {candidate.cidade && <span>{candidate.cidade}, {candidate.estado}</span>}
                                            {candidate.usuario?.email && <span className="flex items-center gap-1"><Mail size={12} /> {candidate.usuario.email}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                                    <div className="text-xs text-gray-400">Aplicou em {candidate.application?.created_at ? new Date(candidate.application.created_at).toLocaleDateString('pt-BR') : '---'}</div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold 
                                            ${(candidate.application?.score || 0) >= 70 ? 'bg-green-100 text-green-700' :
                                                (candidate.application?.score || 0) >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                                            ${sortBy === 'score' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                                            Score: {candidate.application?.score || 0}%
                                        </div>

                                        {/* DISC Scores with highlighting */}
                                        <div className="flex gap-1">
                                            <span
                                                className={`px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold transition-all
                                                    ${sortBy === 'score_D' ? 'ring-2 ring-purple-500 ring-offset-1 scale-110 bg-purple-100' : ''}`}
                                                title="Dominância"
                                            >
                                                D:{breakdown.D}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold transition-all
                                                    ${sortBy === 'score_I' ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 bg-blue-100' : ''}`}
                                                title="Influência"
                                            >
                                                I:{breakdown.I}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-semibold transition-all
                                                    ${sortBy === 'score_S' ? 'ring-2 ring-green-500 ring-offset-1 scale-110 bg-green-100' : ''}`}
                                                title="Estabilidade"
                                            >
                                                S:{breakdown.S}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-semibold transition-all
                                                    ${sortBy === 'score_C' ? 'ring-2 ring-orange-500 ring-offset-1 scale-110 bg-orange-100' : ''}`}
                                                title="Conformidade"
                                            >
                                                C:{breakdown.C}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleShowAnswers(candidate.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                            <FileText size={14} />
                                            Ver Respostas
                                        </button>
                                        <button
                                            onClick={() => handleShowAnalysis(candidate.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                                        >
                                            <Brain size={14} />
                                            Análise IA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {selectedCandidate && (
                <>
                    <AnswersModal
                        isOpen={showAnswers}
                        onClose={() => {
                            setShowAnswers(false);
                            setSelectedCandidate(null);
                        }}
                        candidateName={(() => {
                            const candidate = sortedCandidates.find(c => c.id === selectedCandidate);
                            return `${candidate?.nome || ''} ${candidate?.sobrenome || ''}`.trim();
                        })()}
                        answers={sortedCandidates.find(c => c.id === selectedCandidate)?.application?.resposta}
                    />
                    <AnalysisModal
                        isOpen={showAnalysis}
                        onClose={() => {
                            setShowAnalysis(false);
                            setSelectedCandidate(null);
                        }}
                        candidateName={(() => {
                            const candidate = sortedCandidates.find(c => c.id === selectedCandidate);
                            return `${candidate?.nome || ''} ${candidate?.sobrenome || ''}`.trim();
                        })()}
                        breakdown={sortedCandidates.find(c => c.id === selectedCandidate)?.application?.breakdown}
                        score={sortedCandidates.find(c => c.id === selectedCandidate)?.application?.score || 0}
                    />
                </>
            )}
        </>
    );
}
