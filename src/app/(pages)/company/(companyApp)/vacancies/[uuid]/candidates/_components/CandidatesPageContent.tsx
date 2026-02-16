"use client";

import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, User, BrainCircuit, MessageSquare, ExternalLink, FileText, Brain, Video, Play } from "lucide-react";
import Link from 'next/link';
import { ApplicationDetails } from "./ApplicationDetails";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeedbackModal } from "../../ranking/_components/FeedbackModal";
import { AnswersModal } from "../../ranking/_components/AnswersModal";
import { AnalysisModal } from "../../ranking/_components/AnalysisModal";
import { VideoAnalysisModal } from "./VideoAnalysisModal";
import { submitFeedback, requestVideo } from "../../../actions";
import { toast } from "sonner";

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
    const [isPending, startTransition] = useTransition();

    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedFeedbackCandidate, setSelectedFeedbackCandidate] = useState<any | null>(null);

    const [showAnswers, setShowAnswers] = useState(false);
    const [selectedAnswersCandidate, setSelectedAnswersCandidate] = useState<any | null>(null);

    const [showAnalysis, setShowAnalysis] = useState(false);
    const [selectedAnalysisCandidate, setSelectedAnalysisCandidate] = useState<any | null>(null);

    const [showVideo, setShowVideo] = useState(false);
    const [selectedVideoCandidate, setSelectedVideoCandidate] = useState<any | null>(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

    const [videoRequestCandidate, setVideoRequestCandidate] = useState<any | null>(null);
    const [activeCandidateId, setActiveCandidateId] = useState<number | string | null>(null);

    const parseBreakdown = (breakdown: string | null | undefined) => {
        if (!breakdown) return { D: 0, I: 0, S: 0, C: 0, video: null, suggestions: null, videoAnalysis: null, feedback: null };
        try {
            const parsed = JSON.parse(breakdown);
            return {
                D: parsed.d_score || 0,
                I: parsed.i_score || 0,
                S: parsed.s_score || 0,
                C: parsed.c_score || 0,
                video: parsed.video,
                suggestions: parsed.suggestions,
                feedback: parsed.feedback,
                videoAnalysis: parsed.videoAnalysis
            };
        } catch {
            return { D: 0, I: 0, S: 0, C: 0, video: null, suggestions: null, videoAnalysis: null, feedback: null };
        }
    };

    const handleFeedbackClick = (e: React.MouseEvent, candidate: any) => {
        e.preventDefault();
        setSelectedFeedbackCandidate(candidate);
        setShowFeedback(true);
    };

    const handleShowAnswers = (candidate: any) => {
        setSelectedAnswersCandidate(candidate);
        setShowAnswers(true);
    };

    const handleShowAnalysis = (candidate: any) => {
        setSelectedAnalysisCandidate(candidate);
        setShowAnalysis(true);
    };

    const handleShowVideo = (candidate: any, url: string) => {
        setSelectedVideoCandidate(candidate);
        setSelectedVideoUrl(url);
        setShowVideo(true);
    };

    const handleRequestVideoClick = (candidate: any) => {
        setVideoRequestCandidate(candidate);
    };

    const confirmRequestVideo = () => {
        if (!videoRequestCandidate || !vacancyUuid) return;

        startTransition(async () => {
            const result = await requestVideo(videoRequestCandidate.id, vacancyUuid);
            if (result.success) {
                toast.success(t('ranking_video_request_success', 'Solicitação enviada com sucesso!'));
                router.refresh();
                setVideoRequestCandidate(null);
            } else {
                toast.error(result.error || t('ranking_video_request_error', 'Erro ao solicitar vídeo'));
            }
        });
    };

    const handleFeedbackSubmit = async (status: 'APPROVED' | 'REJECTED', justification: string) => {
        if (!selectedFeedbackCandidate || !vacancyUuid) return;
        await submitFeedback(selectedFeedbackCandidate.id, vacancyUuid, status, justification);
        router.refresh();
    };

    useEffect(() => {
        if (candidates && candidates.length > 0 && activeCandidateId === null) {
            setActiveCandidateId(candidates[0].id);
        }
    }, [candidates, activeCandidateId]);

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
                <>
                    <div className="grid grid-cols-1 gap-6 pb-24">
                        {candidates && candidates.map((candidate, index) => {
                            const feedbackStatus = candidate.breakdown?.feedback?.status;

                            return (
                                <div id={`candidate-${candidate.id}`} key={candidate.id} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

                                    {feedbackStatus && (
                                        <div className={`absolute right-6 top-6 z-10 px-4 py-2 rounded-lg text-sm font-bold border shadow-md select-none
                                        ${feedbackStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {feedbackStatus === 'APPROVED' ? t('approved', 'Aprovado') : t('rejected', 'Reprovado')}
                                        </div>
                                    )}

                                    <div className="p-6 pb-24">
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

                                        <ApplicationDetails application={candidate.application} candidate={candidate} vacancyUuid={vacancyUuid} />
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    {candidates && candidates.length > 0 && (() => {
                        console.log('Current activeCandidateId:', activeCandidateId);
                        console.log('All candidate IDs:', candidates.map(c => ({ id: c.id, type: typeof c.id })));
                        
                        const activeCandidate = candidates.find(c => String(c.id) === String(activeCandidateId));
                        console.log('Found activeCandidate:', activeCandidate ? `${activeCandidate.nome} ${activeCandidate.sobrenome}` : 'NOT FOUND');
                        
                        const finalCandidate = activeCandidate || candidates[0];
                        const feedbackStatus = finalCandidate.breakdown?.feedback?.status;
                        
                        return (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-5xl w-full px-4 z-50">
                                <div className="px-6 py-4 bg-white/95 backdrop-blur-md border border-gray-200/50 flex items-center justify-between gap-8 rounded-2xl shadow-2xl">
                                    <div className="flex items-center gap-3 min-w-[200px] max-w-[280px] mr-4 flex-shrink-0">
                                        <User size={16} className="text-blue-600 flex-shrink-0" />
                                        <select
                                            value={String(activeCandidateId ?? candidates[0]?.id ?? '')}
                                            onChange={(e) => {
                                                const candidateId = e.target.value;
                                                console.log('Selecting candidate ID:', candidateId);
                                                console.log('Available candidates:', candidates.map(c => ({ id: c.id, name: `${c.nome} ${c.sobrenome}` })));
                                                setActiveCandidateId(candidateId);
                                                setTimeout(() => {
                                                    const element = document.getElementById(`candidate-${candidateId}`);
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                }, 100);
                                            }}
                                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all truncate"
                                        >
                                            {candidates.map((candidate, index) => (
                                                <option key={candidate.id} value={candidate.id}>
                                                    #{index + 1} - {candidate.nome} {candidate.sobrenome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {finalCandidate.uuid && (
                                            <a
                                                href={`/viewer/candidate/${finalCandidate.uuid}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                                            >
                                                <ExternalLink size={14} />
                                                {t('vacancy_view_public_profile', 'Perfil Público')}
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleShowAnswers(finalCandidate)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                            <FileText size={14} />
                                            {t('ranking_view_answers', 'Ver Respostas')}
                                        </button>
                                        <button
                                            onClick={() => handleShowAnalysis(finalCandidate)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                                        >
                                            <Brain size={14} />
                                            {t('ranking_ai_analysis', 'Análise IA')}
                                        </button>

                                        {(() => {
                                            const breakdown = parseBreakdown(finalCandidate.application?.breakdown);
                                            const status = breakdown?.video?.status;
                                            const hasFeedback = breakdown?.feedback?.status;
                                            const hasVideoRequest = status === 'requested' || status === 'submitted';

                                            if (status === 'submitted') {
                                                return (
                                                    <button
                                                        onClick={() => handleShowVideo(finalCandidate, breakdown.video.url)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer shadow-sm shadow-green-200"
                                                    >
                                                        <Play size={14} />
                                                        {t('watch_video', 'Ver Vídeo')}
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button
                                                    onClick={() => handleRequestVideoClick(finalCandidate)}
                                                    disabled={hasVideoRequest || !!hasFeedback || isPending}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer
                                                    ${hasVideoRequest || hasFeedback
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                >
                                                    <Video size={14} />
                                                    {hasVideoRequest ? t('ranking_video_requested', 'Vídeo Solicitado') : t('ranking_request_video', 'Solicitar Vídeo')}
                                                </button>
                                            );
                                        })()}

                                        {!feedbackStatus && (
                                            <button
                                                onClick={(e) => handleFeedbackClick(e, finalCandidate)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                                            >
                                                <MessageSquare size={14} />
                                                {t('ranking_send_feedback', 'Dar Feedback')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </>
            )} {selectedFeedbackCandidate && (
                <FeedbackModal
                    isOpen={showFeedback}
                    onClose={() => {
                        setShowFeedback(false);
                        setSelectedFeedbackCandidate(null);
                    }}
                    candidateName={`${selectedFeedbackCandidate.nome} ${selectedFeedbackCandidate.sobrenome}`}
                    candidateId={selectedFeedbackCandidate.id}
                    onSubmit={handleFeedbackSubmit}
                />
            )}

            {selectedAnswersCandidate && (
                <AnswersModal
                    isOpen={showAnswers}
                    onClose={() => {
                        setShowAnswers(false);
                        setSelectedAnswersCandidate(null);
                    }}
                    candidateName={`${selectedAnswersCandidate.nome} ${selectedAnswersCandidate.sobrenome}`}
                    answers={selectedAnswersCandidate.application?.resposta}
                />
            )}

            {selectedAnalysisCandidate && (
                <AnalysisModal
                    isOpen={showAnalysis}
                    onClose={() => {
                        setShowAnalysis(false);
                        setSelectedAnalysisCandidate(null);
                    }}
                    candidateName={`${selectedAnalysisCandidate.nome} ${selectedAnalysisCandidate.sobrenome}`}
                    breakdown={selectedAnalysisCandidate.application?.breakdown}
                    score={selectedAnalysisCandidate.application?.score || 0}
                />
            )}

            {selectedVideoCandidate && (
                <VideoAnalysisModal
                    isOpen={showVideo}
                    onClose={() => {
                        setShowVideo(false);
                        setSelectedVideoCandidate(null);
                        setSelectedVideoUrl(null);
                    }}
                    candidateName={`${selectedVideoCandidate.nome} ${selectedVideoCandidate.sobrenome}`}
                    videoUrl={selectedVideoUrl || ""}
                    candidateId={selectedVideoCandidate.id}
                    vacancyUuid={vacancyUuid}
                    vacancyId={selectedVideoCandidate.application?.vaga_id}
                    showFeedbackButton={!parseBreakdown(selectedVideoCandidate.application?.breakdown).feedback?.status}
                    onFeedback={() => {
                        handleFeedbackClick({ preventDefault: () => { } } as any, selectedVideoCandidate);
                    }}
                />
            )}

            {videoRequestCandidate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 mx-auto border border-green-200">
                            <Video size={24} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            {t('modal_video_request_title', 'Solicitar Vídeo')}
                        </h3>

                        <p className="text-gray-600 text-center mb-6 leading-relaxed">
                            {t('modal_video_request_desc', 'Deseja solicitar um vídeo de apresentação para este candidato? Ele receberá um email com as instruções.')}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setVideoRequestCandidate(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                {t('modal_video_request_cancel', 'Cancelar')}
                            </button>
                            <button
                                onClick={confirmRequestVideo}
                                disabled={isPending}
                                className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 border border-green-200"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                                        {t('modal_video_request_sending', 'Enviando...')}
                                    </>
                                ) : (
                                    t('modal_video_request_confirm_btn', 'Confirmar Envio')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
