"use client";

import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, User, BrainCircuit, MessageSquare } from "lucide-react";
import Link from 'next/link';
import { ApplicationDetails } from "./ApplicationDetails";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeedbackModal } from "../../ranking/_components/FeedbackModal";
import { submitFeedback } from "../../../actions";

interface CandidatesPageContentProps {
    state: 'access_denied' | 'not_found' | 'company_mismatch' | 'success';
    vacancy?: {
        cargo: string;
    } | null;
    candidates?: any[];
    vacancyUuid?: string;
}

export function CandidatesPageContent({ state, vacancy, candidates, vacancyUuid }: CandidatesPageContentProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedFeedbackCandidate, setSelectedFeedbackCandidate] = useState<any | null>(null);

    const handleFeedbackClick = (e: React.MouseEvent, candidate: any) => {
        e.preventDefault(); 
        setSelectedFeedbackCandidate(candidate);
        setShowFeedback(true);
    };

    const handleFeedbackSubmit = async (status: 'APPROVED' | 'REJECTED', justification: string) => {
        if (!selectedFeedbackCandidate || !vacancyUuid) return;
        await submitFeedback(selectedFeedbackCandidate.id, vacancyUuid, status, justification);
        router.refresh();
    };

    if (state === 'access_denied') {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('candidates_page_access_denied_title')}</h1>
                    <p className="text-gray-500">{t('candidates_page_access_denied_desc')}</p>
                </div>
            </div>
        );
    }


    if (state === 'not_found') {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    {t('candidates_page_back_to_vacancies')}
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('candidates_page_vacancy_not_found')}</h1>
                </div>
            </div>
        );
    }

    if (state === 'company_mismatch') {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{t('candidates_page_access_denied_title')}</h1>
                    <p className="text-gray-500">{t('candidates_page_access_denied_desc_2')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    {t('candidates_page_back_to_vacancies')}
                </Link>
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">{t('candidates_page_title')}<span className="text-blue-600">{vacancy?.cargo}</span></h1>
                    <p className="text-gray-500">{t('candidates_page_subtitle')}</p>
                </div>
            </div>

            {candidates && candidates.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500">{t('candidates_page_no_candidates')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {candidates && candidates.map((candidate, index) => {
                        const feedbackStatus = candidate.breakdown?.feedback?.status;
                        
                        return (
                        <div id={`candidate-${candidate.id}`} key={candidate.id} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            
                            {feedbackStatus ? (
                                <div className={`absolute right-6 bottom-6 z-10 px-4 py-2 rounded-lg text-sm font-bold border shadow-md select-none
                                    ${feedbackStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {feedbackStatus === 'APPROVED' ? t('approved', 'Aprovado') : t('rejected', 'Reprovado')}
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => handleFeedbackClick(e, candidate)}
                                    className="absolute right-6 bottom-6 z-10 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform active:scale-95"
                                    title={t('give_feedback', 'Dar Feedback')}
                                >
                                    <MessageSquare size={20} />
                                </button>
                            )}

                            <div className="p-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                                {candidate.uuid ? (
                                                    <Link href={`/viewer/candidate/${candidate.uuid}`} className="w-full h-full relative block">
                                                        {candidate.foto_perfil || candidate.usuario?.avatarUrl ? (
                                                            <img src={candidate.foto_perfil || candidate.usuario?.avatarUrl!} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                                                        )}
                                                    </Link>
                                                ) : (
                                                    candidate.foto_perfil || candidate.usuario?.avatarUrl ? (
                                                        <img src={candidate.foto_perfil || candidate.usuario?.avatarUrl!} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={32} className="text-blue-400" />
                                                    )
                                                )}
                                            </div>
                                            <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-900">{candidate.nome} {candidate.sobrenome}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                {candidate.cidade && <span>{candidate.cidade}, {candidate.estado}</span>}
                                                {candidate.usuario?.email && <span className="flex items-center gap-1"><Mail size={12} /> {candidate.usuario.email}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="text-xs text-gray-400">{t('candidates_page_applied_on')} {candidate.application?.created_at ? new Date(candidate.application.created_at).toLocaleDateString(i18n.language) : '---'}</div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('candidates_page_match_score')}</span>
                                            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-lg font-black bg-blue-600 text-white shadow-lg shadow-blue-100">
                                                {candidate.application?.score || 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Justificativa da IA (Preview) */}
                                {candidate.breakdown?.reason && (
                                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BrainCircuit size={16} className="text-blue-600" />
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('candidates_page_ai_justification')}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
                                            "{candidate.breakdown.reason}"
                                        </p>
                                    </div>
                                )}

                                <ApplicationDetails application={candidate.application} vacancyUuid={vacancyUuid} />
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {selectedFeedbackCandidate && (
                <FeedbackModal 
                    isOpen={showFeedback}
                    onClose={() => {
                        setShowFeedback(false);
                        setSelectedFeedbackCandidate(null);
                    }}
                    candidateName={`${selectedFeedbackCandidate.nome} ${selectedFeedbackCandidate.sobrenome}`}
                    candidateId={selectedFeedbackCandidate.id}
                    onSubmit={handleFeedbackSubmit}
                    aiSuggestions={selectedFeedbackCandidate.breakdown?.suggestions}
                />
            )}
        </div>
    );
}
