"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Clock,
    AlertTriangle,
    Send,
    CheckCircle2,
    BrainCircuit,
    Lock,
    ShieldAlert,
    Timer
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

interface Question {
    id: string;
    text: string;
    category: string;
    method: string;
    isCustom?: boolean;
    originalIndex?: number;
}

interface AssessmentProps {
    vacancy: {
        id: string;
        cargo: string;
        pergunta?: string | null;
        vaga_soft_skill: Array<{
            soft_skill: {
                nome: string;
            };
        }>;
    };
    candidateId: string;
}

const softSkillToCategory: Record<string, string> = {
    "Pensamento Crítico": "Cognitiva",
    "Resolução de Problemas Complexos": "Cognitiva",
    "Inteligência Emocional": "Social_Emocional",
    "Comunicação Assertiva": "Comunicacao",
    "Adaptabilidade": "Atitude",
    "Criatividade e Inovação": "Cognitiva",
    "Aprendizado Contínuo": "Autogestao",
    "Trabalho em Equipe": "Social",
    "Liderança Inspiradora": "Lideranca",
    "Resiliência": "Atitude",
    "Pensamento Analítico": "Cognitiva",
    "Tomada de Decisão": "Cognitiva",
    "Orientação para Resultados": "Produtividade",
    "Negociação": "Comunicacao",
    "Ética Profissional": "Atitude",
    "Gestão do Tempo": "Produtividade",
    "Empatia": "Social_Emocional",
    "Flexibilidade Cognitiva": "Cognitiva",
    "Mentalidade de Crescimento": "Autogestao",
    "Autonomia": "Autogestao"
};

const DISC_METHODS = ["Dominância", "Influência", "Estabilidade", "Conformidade"];

export default function AssessmentComponent({ vacancy, candidateId }: AssessmentProps) {
    const { t, i18n } = useTranslation();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [penaltyCount, setPenaltyCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showIncompleteModal, setShowIncompleteModal] = useState(false);
    const initializedRef = useRef(false);

    // Memoized para poder ser chamada dentro do useEffect sem warnings de dependência
    const generateQuestions = useCallback(() => {
        const selectedQuestions: Question[] = [];
        const questionsData = t('questions', { returnObjects: true }) as any;
        const banco = questionsData?.banco_questoes_disc_full || {};

        const categories = vacancy.vaga_soft_skill
            .map(vss => softSkillToCategory[vss.soft_skill.nome])
            .filter(Boolean);
        const uniqueCategories = Array.from(new Set(categories));

        uniqueCategories.forEach(cat => {
            if (banco[cat]) {
                DISC_METHODS.forEach(method => {
                    const pool = banco[cat][method];
                    if (pool && pool.length > 0) {
                        const randomIndex = Math.floor(Math.random() * pool.length);
                        const randomQuestion = pool[randomIndex];
                        selectedQuestions.push({
                            id: `${cat}-${method}-${Math.random()}`,
                            text: randomQuestion,
                            category: cat,
                            method: method,
                            originalIndex: randomIndex
                        });
                    }
                });
            }
        });

        if (vacancy.pergunta) {
            const customQuestions = vacancy.pergunta.split('\n').filter(q => q.trim());
            customQuestions.forEach((q, idx) => {
                selectedQuestions.push({
                    id: `custom-${idx}-${Math.random()}`,
                    text: q.trim(),
                    category: "Personalizada",
                    method: "N/A",
                    isCustom: true
                });
            });
        }

        setQuestions(selectedQuestions);
    }, [vacancy, t]);

    // Effect to update question text when language changes
    useEffect(() => {
        if (questions.length === 0) return;

        const questionsData = t('questions', { returnObjects: true }) as any;
        const banco = questionsData?.banco_questoes_disc_full || {};

        setQuestions(prevQuestions => prevQuestions.map(q => {
            if (q.isCustom || q.originalIndex === undefined) return q;

            const newText = banco[q.category]?.[q.method]?.[q.originalIndex];
            if (newText && newText !== q.text) {
                return { ...q, text: newText };
            }
            return q;
        }));
    }, [t, i18n.language]);

    const handleScreenLeave = useCallback(() => {
        // Bloqueia o reset se a prova já tiver sido finalizada ou estiver enviando ou ainda não começou
        if (isFinished || isSubmitting || !isStarted) return;

        setPenaltyCount(prev => prev + 1);
        generateQuestions();
        setAnswers({});
        setShowPenaltyModal(true);
    }, [isFinished, isSubmitting, isStarted, generateQuestions]);

    useEffect(() => {
        if (isStarted && !initializedRef.current) {
            generateQuestions();
            initializedRef.current = true;
        }

        // 1. Bloqueio de Comandos de Cópia e Context Menu
        const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        // 2. Detecção de Mudança de Aba (Visibility API)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleScreenLeave();
            }
        };

        // 3. Detecção de Perda de Foco da Janela (Alt + Tab)
        const handleWindowBlur = () => {
            setTimeout(() => {
                if (document.visibilityState === "hidden") {
                    handleScreenLeave();
                }
            }, 150);
        };

        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, [isStarted, generateQuestions, handleScreenLeave]);

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirmSubmit = () => {
        const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length;
        if (answeredCount < questions.length) {
            setShowIncompleteModal(true);
            return;
        }
        setShowConfirmModal(true);
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);
        const endTime = Date.now();
        const durationSeconds = Math.floor((endTime - (startTime || endTime)) / 1000);

        const payload = {
            vaga_id: vacancy.id,
            candidato_id: candidateId,
            duration: durationSeconds,
            penalties: penaltyCount,
            responses: questions.map(q => ({
                question: q.text,
                answer: answers[q.id],
                category: q.category,
                method: q.method
            }))
        };

        try {
            const res = await fetch("/api/vacancies/apply/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFinished(true);
            } else {
                throw new Error(t('assessment_error_sending'));
            }
        } catch (error) {
            console.error(error);
            alert(t('assessment_error_generic'));
            setIsSubmitting(false);
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{t('assessment_success_title')}</h1>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {t('assessment_success_desc')}
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
                    >
                        {t('assessment_success_btn')}
                    </button>
                </div>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">{t('assessment_instructions_title')}</h1>
                    <div className="space-y-6 text-slate-600 mb-10">
                        <div className="flex items-start gap-4">
                            <span className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mt-1">1</span>
                            <div>
                                <p className="font-semibold text-slate-800">{t('assessment_rule_1_title')}</p>
                                <p className="text-sm">{t('assessment_rule_1_desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mt-1">2</span>
                            <div>
                                <p className="font-semibold text-slate-800">{t('assessment_rule_2_title')}</p>
                                <p className="text-sm">{t('assessment_rule_2_desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mt-1">3</span>
                            <div>
                                <p className="font-semibold text-slate-800">{t('assessment_rule_3_title')}</p>
                                <p className="text-sm">{t('assessment_rule_3_desc')}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsStarted(true);
                            setStartTime(Date.now());
                        }}
                        className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <span>{t('assessment_start_btn')}</span>
                        <Send size={18} />
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-medium">
                        {t('assessment_timer_hint')}
                    </p>
                </div>
            </div>
        );
    }

    const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length;
    const remainingCount = questions.length - answeredCount;
    const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Fixed Progress Bar */}
            <div className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('assessment_progress_answered')}</span>
                                <span className="text-xl font-bold text-slate-900 leading-none">{answeredCount}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('assessment_progress_remaining')}</span>
                                <span className="text-xl font-bold text-slate-900 leading-none">{remainingCount}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                                <Timer size={14} className="animate-pulse" />
                                <span className="text-xs font-bold">{Math.round(progressPercentage)}% {t('assessment_progress_completed')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-24 lg:h-28" />

            <div className="py-8 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
                        {/* Header */}
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-blue-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">{t('assessment_badge_interview')}</span>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">{vacancy.cargo}</h1>
                                <div className="flex items-center gap-4 text-slate-400 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <BrainCircuit size={16} />
                                        <span>{questions.length} {t('assessment_header_questions')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Lock size={16} />
                                        <span>{t('assessment_header_secure')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Timer size={120} />
                            </div>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start gap-4">
                            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                {t('assessment_warning_box')}
                            </p>
                        </div>

                        {/* Questions List */}
                        <div className="p-8 space-y-12">
                            {questions.map((q, index) => (
                                <div key={q.id} className="group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-lg font-semibold text-slate-800 leading-snug pt-1">
                                            {q.text}
                                        </h3>
                                    </div>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 hover:bg-white resize-none min-h-[120px] text-slate-700 leading-relaxed"
                                        placeholder={t('assessment_answer_placeholder')}
                                        value={answers[q.id] || ""}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        autoComplete="off"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-slate-500 text-sm flex items-center gap-2">
                                <Clock size={16} />
                                <span>{t('assessment_footer_timer')}</span>
                            </div>
                            <button
                                onClick={handleConfirmSubmit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Clock className="animate-spin" size={20} />
                                        <span>{t('assessment_btn_sending')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('assessment_btn_send')}</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Incomplete Answers Modal */}
                {showIncompleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('attention_title')}</h2>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {t('assessment_alert_answer_all', { count: questions.length })}
                            </p>
                            <button
                                onClick={() => setShowIncompleteModal(false)}
                                className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all active:scale-95 shadow-xl shadow-amber-200 cursor-pointer"
                            >
                                {t('answers_modal_close')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Penalty Modal */}
                {showPenaltyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldAlert size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('assessment_penalty_title')}</h2>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {t('assessment_penalty_desc')}
                            </p>
                            <button
                                onClick={() => setShowPenaltyModal(false)}
                                className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all active:scale-95 shadow-xl shadow-amber-200 cursor-pointer"
                            >
                                {t('assessment_penalty_btn')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('assessment_confirm_title')}</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            {t('assessment_confirm_desc')}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 cursor-pointer"
                            >
                                {t('assessment_confirm_btn_yes')}
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="w-full py-4 bg-white text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 border border-slate-200 cursor-pointer"
                            >
                                {t('assessment_confirm_btn_no')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}