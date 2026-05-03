"use client";

import { useState, useTransition } from "react";
import { Mail, FileText, Brain, User, ExternalLink, Video, MessageSquare, AlertTriangle, Play, CalendarPlus, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { AnswersModal } from "./AnswersModal";
import { AnalysisModal } from "./AnalysisModal";
import { VideoAnalysisModal } from "../../candidates/_components/VideoAnalysisModal";
import { FeedbackModal } from "./FeedbackModal";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { ViewMentorFeedbackModal } from "./ViewMentorFeedbackModal";
import { FinalDecisionModal, ProposalData } from "./FinalDecisionModal";
import { useTranslation } from "react-i18next";
import { requestVideo, submitFeedback } from "../../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Application {
    id: string;
    score: number;
    created_at: Date;
    breakdown?: string | null;
    resposta?: string | null;
    interviewStatus?: string;
    mentorFeedback?: {
        comportamental: string | null;
        tecnico: string | null;
        geral: string | null;
        nota_comportamental: number | null;
        nota_tecnica: number | null;
        nota_geral: number | null;
        nota_mentor: number | null;
        enviado_em: Date | null;
        candidato_entrou_em: Date | null;
        candidato_saiu_em: Date | null;
        candidato_compareceu: boolean | null;
        falta_marcada_pelo_mentor: boolean | null;
        mentor: {
            nome: string;
            foto_perfil: string | null;
            uuid: string | null;
        } | null;
    } | null;
}

interface Candidate {
    id: string;
    uuid: string | null;
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
    vacancyUuid: string;
    vacancy?: {
        id?: string;
        cargo: string;
        salario?: number | null;
        moeda?: string | null;
        tipo_local_trabalho?: string | null;
        cidade?: string | null;
        estado?: string | null;
    } | null;
    pendingCandidateId?: string;
}

type SortOption = 'score' | 'score_D' | 'score_I' | 'score_S' | 'score_C';

export function RankingList({ candidates, vacancyUuid, vacancy, pendingCandidateId }: RankingListProps) {
    const { t } = useTranslation();
    const [sortBy, setSortBy] = useState<SortOption>('score');
    const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'final_decision'>('all');
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackCandidate, setFeedbackCandidate] = useState<string | null>(null);
    const [videoRequestCandidate, setVideoRequestCandidate] = useState<string | null>(null);
    const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null);
    const [viewMentorFeedbackCandidate, setViewMentorFeedbackCandidate] = useState<string | null>(null);
    const [showFinalDecision, setShowFinalDecision] = useState(false);
    const [finalDecisionCandidate, setFinalDecisionCandidate] = useState<Candidate | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Parse breakdown to extract DISC scores
    const parseBreakdown = (breakdown: string | null | undefined) => {
        if (!breakdown) return { D: 0, I: 0, S: 0, C: 0, video: null, suggestions: null, feedback: null as any, videoAnalysis: null, finalDecision: null as any };

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
                videoAnalysis: parsed.videoAnalysis,
                finalDecision: parsed.finalDecision
            };
        } catch {
            return { D: 0, I: 0, S: 0, C: 0, video: null, suggestions: null, feedback: null as any, videoAnalysis: null, finalDecision: null as any };
        }
    };

    // Sort candidates based on selected criteria
    const sortCandidates = (items: Candidate[]) => {
        return [...items].sort((a, b) => {
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
    };

    const filteredCandidates = candidates.filter(candidate => {
        const breakdown = parseBreakdown(candidate.application?.breakdown);
        const status = breakdown.feedback?.status;
        const finalStatus = breakdown.finalDecision?.status;

        if (filter === 'final_decision') return !!finalStatus;
        if (finalStatus) return false;

        if (filter === 'approved') return status === 'APPROVED';
        if (filter === 'rejected') return status === 'REJECTED';
        return true;
    });

    // Mostrar todos os candidatos filtrados
    const displayCandidates = filteredCandidates;

    const sortedCandidates = sortCandidates(displayCandidates);

    const handleShowAnswers = (candidateId: string) => {
        setSelectedCandidate(candidateId);
        setShowAnswers(true);
        setShowAnalysis(false);
    };

    const handleShowAnalysis = (candidateId: string) => {
        setSelectedCandidate(candidateId);
        setShowAnalysis(true);
        setShowAnswers(false);
        setShowVideo(false);
    };

    const handleShowVideo = (candidateId: string, url: string) => {
        setSelectedCandidate(candidateId);
        setSelectedVideoUrl(url);
        setShowVideo(true);
        setShowAnswers(false);
        setShowAnalysis(false);
    };

    const handleRequestVideoClick = (candidateId: string) => {
        setVideoRequestCandidate(candidateId);
    };

    const handleFeedbackClick = (candidateId: string) => {
        setFeedbackCandidate(candidateId);
        setShowFeedback(true);
    };

    const handleFeedbackSubmit = async (status: 'APPROVED' | 'REJECTED', justification: string) => {
        const currentCandidateId = feedbackCandidate;
        if (!currentCandidateId) return;

        await submitFeedback(currentCandidateId, vacancyUuid, status, justification);

        if (pendingCandidateId && currentCandidateId === pendingCandidateId) {
            window.location.replace(`/company/vacancies/${vacancyUuid}/ranking`);
        } else {
            router.refresh();
        }
    };

    const handleFinalDecisionSubmit = async (data: ProposalData) => {
        if (!finalDecisionCandidate) return;

        try {
            const res = await fetch('/api/company/proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidato_id: finalDecisionCandidate.id,
                    vaga_id: vacancy?.id,
                    vaga_uuid: vacancyUuid,
                    ...data
                })
            });

            const json = await res.json();
            if (json.success) {
                setShowFinalDecision(false);
                setFinalDecisionCandidate(null);
                toast.success('Decisão final registrada com sucesso!');
                router.refresh();
            } else {
                throw new Error(json.error || "Erro ao salvar a decisão.");
            }
        } catch (e) {
            throw e;
        }
    };

    const confirmRequestVideo = () => {
        if (!videoRequestCandidate) return;

        startTransition(async () => {
            const result = await requestVideo(videoRequestCandidate, vacancyUuid);
            if (result.success) {
                toast.success(t('ranking_video_request_success'));
                router.refresh();
                setVideoRequestCandidate(null);
            } else {
                toast.error(t('ranking_video_request_error') + result.error);
            }
        });
    };

    const renderFeedbackButton = (candidate: Candidate, breakdown: any) => {
        const feedback = breakdown?.feedback;

        if (feedback?.status) {
            const isApproved = feedback.status === 'APPROVED';
            return (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-default
                    ${isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {isApproved ? t('approved') : t('rejected')}
                </div>
            );
        }

        return (
            <button
                onClick={() => handleFeedbackClick(candidate.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
            >
                <MessageSquare size={14} />
                {t('ranking_send_feedback', 'Enviar Feedback')}
            </button>
        );
    };

    return (
        <>
            {/* Banner informativo quando está avaliando candidato pendente */}
            {pendingCandidateId && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900 text-sm">
                                {t('ranking_pending_mode_title')}
                            </h3>
                            <p className="text-amber-700 text-xs mt-1">
                                {t('ranking_pending_mode_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 mb-6">
                {/* Header Controls */}
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="20" x2="12" y2="10"></line>
                                <line x1="18" y1="20" x2="18" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="16"></line>
                            </svg>
                        </div>
                        <div>
                            <label htmlFor="ordenarPor" className="text-sm font-semibold text-gray-700 block">{t('ranking_sort_label')}</label>
                            <p className="text-xs text-gray-500">{t('ranking_sort_placeholder')}</p>
                        </div>
                    </div>
                    <select
                        id="ordenarPor"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-2.5 border-2 border-blue-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
                    >
                        <option value="score">{t('ranking_sort_score')}</option>
                        <option value="score_D">{t('ranking_sort_d')}</option>
                        <option value="score_I">{t('ranking_sort_i')}</option>
                        <option value="score_S">{t('ranking_sort_s')}</option>
                        <option value="score_C">{t('ranking_sort_c')}</option>
                    </select>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${filter === 'all'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('ranking_filter_all', 'Todos os Candidatos')}
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${filter === 'approved'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('ranking_filter_approved', 'Aprovados')}
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${filter === 'rejected'
                            ? 'bg-white text-red-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('ranking_filter_rejected', 'Reprovados')}
                    </button>
                    <button
                        onClick={() => setFilter('final_decision')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-l border-gray-200 ml-2 pl-6 ${filter === 'final_decision'
                            ? 'bg-white text-indigo-600 shadow-sm font-bold'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Contratados / Recusados
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sortedCandidates.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                        <p className="text-gray-500">{t('ranking_no_candidates')}</p>
                    </div>
                ) : (
                    sortedCandidates.map((candidate, index) => {
                        const breakdown = parseBreakdown(candidate.application?.breakdown);

                        const isExpired = breakdown?.video?.status === 'requested' && breakdown?.video?.deadline
                            ? new Date() > new Date(breakdown.video.deadline)
                            : false;
                        const isPendingTarget = pendingCandidateId && candidate.id === pendingCandidateId;
                        const isDisabled = pendingCandidateId && !isPendingTarget;

                        return (
                            <div
                                key={candidate.id}
                                className={`relative bg-white p-6 rounded-xl border transition-all
                                    ${isDisabled ? 'grayscale opacity-60 pointer-events-none' : 'hover:shadow-md'}
                                    ${isPendingTarget ? 'border-amber-400 ring-4 ring-amber-50 shadow-lg scale-[1.01] z-10' : 'border-gray-100 shadow-sm'}
                                `}
                            >

                                {/* Ranking Badge */}
                                <div className={`absolute -left-2 -top-2 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm z-10
                                    ${isDisabled ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white'}
                                `}>
                                    #{index + 1}
                                </div>

                                {/* Pending Evaluation Badge */}
                                {isPendingTarget && (
                                    <div className="absolute -right-2 -top-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 animate-pulse z-20">
                                        <AlertTriangle size={12} />
                                        {t('ranking_pending_feedback', 'Feedback Pendente')}
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 ml-2">
                                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0 border border-blue-200">
                                            {candidate.foto_perfil || candidate.usuario?.avatarUrl ? (
                                                <img src={candidate.foto_perfil || candidate.usuario?.avatarUrl!} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <User size={32} className="text-blue-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{candidate.nome} {candidate.sobrenome}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-0.5">
                                                    {candidate.cidade && <span>{candidate.cidade}, {candidate.estado}</span>}
                                                    {candidate.usuario?.email && <span className="flex items-center gap-1"><Mail size={12} /> {candidate.usuario.email}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                                        <div className="text-xs text-gray-400">{t('ranking_applied_on')} {candidate.application?.created_at ? new Date(candidate.application.created_at).toLocaleDateString('pt-BR') : '---'}</div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold 
                                                ${(candidate.application?.score || 0) >= 70 ? 'bg-green-100 text-green-700' :
                                                    (candidate.application?.score || 0) >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                                                ${sortBy === 'score' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                                                {t('ranking_score_label')} {candidate.application?.score || 0}%
                                            </div>

                                            {/* DISC Scores with highlighting */}
                                            <div className="flex gap-1">
                                                <span
                                                    className={`px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold transition-all
                                                        ${sortBy === 'score_D' ? 'ring-2 ring-purple-500 ring-offset-1 scale-110 bg-purple-100' : ''}`}
                                                    title={t('disc_dominance')}
                                                >
                                                    D:{breakdown.D}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold transition-all
                                                        ${sortBy === 'score_I' ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 bg-blue-100' : ''}`}
                                                    title={t('disc_influence')}
                                                >
                                                    I:{breakdown.I}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-semibold transition-all
                                                        ${sortBy === 'score_S' ? 'ring-2 ring-green-500 ring-offset-1 scale-110 bg-green-100' : ''}`}
                                                    title={t('disc_stability')}
                                                >
                                                    S:{breakdown.S}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-semibold transition-all
                                                        ${sortBy === 'score_C' ? 'ring-2 ring-orange-500 ring-offset-1 scale-110 bg-orange-100' : ''}`}
                                                    title={t('disc_compliance')}
                                                >
                                                    C:{breakdown.C}
                                                </span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const warnings: string[] = [];
                                            if (isExpired) warnings.push(t('ranking_video_expired', 'Prazo do vídeo encerrado'));
                                            if (candidate.application?.interviewStatus === 'CANCELADA' || candidate.application?.interviewStatus === 'RECUSADA') warnings.push('Candidato recusou a entrevista');
                                            if (candidate.application?.interviewStatus === 'EXPIRADA') warnings.push('Convite de entrevista encerrado');
                                            if (warnings.length === 0) return null;
                                            return (
                                                <div className="flex justify-end mt-1.5">
                                                    <div className="relative group">
                                                        <div className="p-1 rounded-full bg-red-50 border border-red-200 text-red-500 cursor-help hover:bg-red-100 transition-colors">
                                                            <AlertTriangle size={15} className="stroke-[2.5px]" />
                                                        </div>
                                                        <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover:block">
                                                            <div className="bg-white border border-red-400 text-red-700 text-xs rounded-lg py-2 px-3 shadow-xl min-w-[180px] max-w-[240px]">
                                                                <div className="flex flex-col gap-1.5">
                                                                    {warnings.map((w, i) => (
                                                                        <div key={i} className="flex items-start gap-1.5">
                                                                            <span className="text-red-400 mt-0.5">•</span>
                                                                            <span>{w}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-white border-l border-t border-red-400 rotate-45" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <hr className="border-gray-100 my-4" />

                                <div className="flex gap-2 flex-wrap">
                                    {candidate.uuid && (
                                        <a
                                            href={`/viewer/candidate/${candidate.uuid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                                        >
                                            <ExternalLink size={14} />
                                            {t('vacancy_view_public_profile')}
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleShowAnswers(candidate.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                                    >
                                        <FileText size={14} />
                                        {t('ranking_view_answers')}
                                    </button>
                                    <button
                                        onClick={() => handleShowAnalysis(candidate.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                                    >
                                        <Brain size={14} />
                                        {t('ranking_ai_analysis')}
                                    </button>

                                    {(candidate.application?.mentorFeedback?.enviado_em ||
                                        candidate.application?.mentorFeedback?.falta_marcada_pelo_mentor === true) && (
                                            <button
                                                onClick={() => setViewMentorFeedbackCandidate(candidate.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
                                            >
                                                <MessageSquare size={14} />
                                                Relatório da Entrevista
                                            </button>
                                        )}

                                    {(() => {
                                        const status = breakdown?.video?.status;
                                        const hasFeedback = breakdown?.feedback?.status;
                                        const hasActiveVideoRequest = (status === 'requested' && !isExpired) || status === 'submitted';

                                        if (status === 'submitted') {
                                            return (
                                                <button
                                                    onClick={() => handleShowVideo(candidate.id, breakdown.video.url)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer shadow-sm shadow-green-200"
                                                >
                                                    <Play size={14} />
                                                    {t('watch_video')}
                                                </button>
                                            );
                                        }

                                        return (
                                            <button
                                                onClick={() => handleRequestVideoClick(candidate.id)}
                                                disabled={hasActiveVideoRequest || hasFeedback || isPending}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                                                    ${hasActiveVideoRequest || hasFeedback
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                            >
                                                <Video size={14} />
                                                {hasActiveVideoRequest ? t('ranking_video_requested') : t('ranking_request_video')}
                                            </button>
                                        );
                                    })()}

                                    {renderFeedbackButton(candidate, breakdown)}

                                    {breakdown?.finalDecision?.status ? (
                                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-default
                                            ${breakdown.finalDecision.status === 'APPROVED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                breakdown.finalDecision.status === 'ACEITA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    breakdown.finalDecision.status === 'RECUSADA' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            {breakdown.finalDecision.status === 'ACEITA' ? <CheckCircle2 size={14} /> :
                                                breakdown.finalDecision.status === 'RECUSADA' || breakdown.finalDecision.status === 'REJECTED' ? <XCircle size={14} /> :
                                                    <AlertTriangle size={14} />}
                                            {breakdown.finalDecision.status === 'APPROVED' ? 'Pendente (Aguardando Candidato)' :
                                                breakdown.finalDecision.status === 'ACEITA' ? 'Contratado' :
                                                    breakdown.finalDecision.status === 'RECUSADA' ? 'Proposta Recusada' :
                                                        'Não Selecionado'}
                                        </div>
                                    ) : breakdown?.feedback?.status === 'APPROVED' && (
                                        <>
                                            <button
                                                onClick={() => setScheduleCandidate(candidate)}
                                                disabled={!!candidate.application?.interviewStatus && !['CANCELADA', 'RECUSADA', 'EXPIRADA'].includes(candidate.application?.interviewStatus)}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer
                                                    ${(() => {
                                                        const status = candidate.application?.interviewStatus;
                                                        if (status === 'PENDENTE_CANDIDATO') return 'bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed';
                                                        if (status === 'CONFIRMADA') return 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed';
                                                        if (status === 'CONCLUIDA') return 'bg-blue-50 text-blue-600 border border-blue-200 cursor-not-allowed';
                                                        return 'bg-emerald-500 text-white hover:bg-emerald-600';
                                                    })()}`}
                                            >
                                                <CalendarPlus size={14} />
                                                {(() => {
                                                    const status = candidate.application?.interviewStatus;
                                                    if (status === 'PENDENTE_CANDIDATO') return t('interview_status_requested', 'Solicitada');
                                                    if (status === 'CONFIRMADA') return t('interview_status_confirmed', 'Aceita');
                                                    if (status === 'CONCLUIDA') return t('interview_status_completed', 'Concluída');
                                                    return t('schedule_interview_btn', 'Agendar Entrevista');
                                                })()}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setFinalDecisionCandidate(candidate);
                                                    setShowFinalDecision(true);
                                                }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
                                            >
                                                <Trophy size={14} />
                                                Decisão Final
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div >

            {
                feedbackCandidate && (
                    <FeedbackModal
                        isOpen={showFeedback}
                        onClose={() => {
                            setShowFeedback(false);
                            setFeedbackCandidate(null);
                        }}
                        candidateName={(() => {
                            const candidate = sortedCandidates.find(c => c.id === feedbackCandidate);
                            return `${candidate?.nome || ''} ${candidate?.sobrenome || ''}`.trim();
                        })()}
                        candidateId={feedbackCandidate}

                        onSubmit={handleFeedbackSubmit}
                        aiSuggestions={(() => {
                            const candidate = sortedCandidates.find(c => c.id === feedbackCandidate);
                            const breakdown = parseBreakdown(candidate?.application?.breakdown);
                            const videoFeedback = breakdown.videoAnalysis?.data?.suggestedFeedback;
                            const textSuggestions = breakdown.suggestions;

                            if (videoFeedback && textSuggestions) {
                                const suggestionsList = Array.isArray(textSuggestions)
                                    ? textSuggestions
                                    : [textSuggestions];

                                return {
                                    feedback: videoFeedback,
                                    suggestions: suggestionsList
                                };
                            }

                            if (videoFeedback) return videoFeedback;

                            if (textSuggestions) return textSuggestions;

                            return null;
                        })()}
                    />
                )
            }

            {/* Modals */}
            {
                selectedCandidate && (
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
                        <VideoAnalysisModal
                            isOpen={showVideo}
                            onClose={() => {
                                setShowVideo(false);
                                setSelectedCandidate(null);
                                setSelectedVideoUrl(null);
                            }}
                            candidateName={(() => {
                                const candidate = sortedCandidates.find(c => c.id === selectedCandidate);
                                return `${candidate?.nome || ''} ${candidate?.sobrenome || ''}`.trim();
                            })()}
                            videoUrl={selectedVideoUrl || ""}
                            candidateId={selectedCandidate}
                            vacancyUuid={vacancyUuid}
                            vacancyId={vacancy?.id || ""}
                            showFeedbackButton={(() => {
                                const candidate = sortedCandidates.find(c => c.id === selectedCandidate);
                                const breakdown = parseBreakdown(candidate?.application?.breakdown);
                                return !breakdown?.feedback?.status;
                            })()}
                            onFeedback={() => {
                                if (selectedCandidate) {
                                    handleFeedbackClick(selectedCandidate);
                                }
                            }}
                        />
                    </>
                )
            }

            <ViewMentorFeedbackModal
                isOpen={viewMentorFeedbackCandidate !== null}
                onClose={() => setViewMentorFeedbackCandidate(null)}
                candidateName={(() => {
                    const candidate = sortedCandidates.find(c => c.id === viewMentorFeedbackCandidate);
                    return `${candidate?.nome || ''} ${candidate?.sobrenome || ''}`.trim();
                })()}
                feedback={(() => {
                    const candidate = sortedCandidates.find(c => c.id === viewMentorFeedbackCandidate);
                    return candidate?.application?.mentorFeedback || null;
                })()}
            />

            {/* Video Request Confirmation Modal */}
            {
                videoRequestCandidate && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 mx-auto border border-green-200">
                                <Video size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                {t('modal_video_request_title')}
                            </h3>

                            <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                {t('modal_video_request_desc')}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setVideoRequestCandidate(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    {t('modal_video_request_cancel')}
                                </button>
                                <button
                                    onClick={confirmRequestVideo}
                                    disabled={isPending}
                                    className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 border border-green-200"
                                >
                                    {isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                                            {t('modal_video_request_sending')}
                                        </>
                                    ) : (
                                        t('modal_video_request_confirm_btn')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {scheduleCandidate && (
                <ScheduleInterviewModal
                    isOpen={!!scheduleCandidate}
                    onClose={() => setScheduleCandidate(null)}
                    candidateId={scheduleCandidate.id}
                    candidateName={`${scheduleCandidate.nome || ''} ${scheduleCandidate.sobrenome || ''}`.trim()}
                    vacancyId={vacancy?.id || ''}
                    vacancyTitle={vacancy?.cargo || ''}
                />
            )}

            {finalDecisionCandidate && (
                <FinalDecisionModal
                    isOpen={showFinalDecision}
                    onClose={() => {
                        setShowFinalDecision(false);
                        setFinalDecisionCandidate(null);
                    }}
                    candidateId={finalDecisionCandidate.id}
                    candidateName={`${finalDecisionCandidate.nome || ''} ${finalDecisionCandidate.sobrenome || ''}`.trim()}
                    vacancyId={vacancy?.id || ''}
                    vacancyTitle={vacancy?.cargo || ''}
                    vacancyDetails={vacancy}
                    onSubmit={handleFinalDecisionSubmit}
                />
            )}
        </>
    );
}
