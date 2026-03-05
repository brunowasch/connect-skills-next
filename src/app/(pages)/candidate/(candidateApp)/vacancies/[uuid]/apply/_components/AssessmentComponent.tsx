"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  AlertTriangle,
  Send,
  CheckCircle2,
  BrainCircuit,
  Lock,
  ShieldAlert,
  Timer,
  ChevronRight,
  ChevronLeft,
  ListChecks,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

const SECTION_SIZE = 8;
const MAX_BANK_QUESTIONS = SECTION_SIZE;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
  Adaptabilidade: "Atitude",
  "Criatividade e Inovação": "Cognitiva",
  "Aprendizado Contínuo": "Autogestao",
  "Trabalho em Equipe": "Social",
  "Liderança Inspiradora": "Lideranca",
  Resiliência: "Atitude",
  "Pensamento Analítico": "Cognitiva",
  "Tomada de Decisão": "Cognitiva",
  "Orientação para Resultados": "Produtividade",
  Negociação: "Comunicacao",
  "Ética Profissional": "Atitude",
  "Gestão do Tempo": "Produtividade",
  Empatia: "Social_Emocional",
  "Flexibilidade Cognitiva": "Cognitiva",
  "Mentalidade de Crescimento": "Autogestao",
  Autonomia: "Autogestao",
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
  const [currentSection, setCurrentSection] = useState(0);
  const initializedRef = useRef(false);

  const generateQuestions = useCallback(() => {
    const allBankQuestions: Question[] = [];
    const questionsData = t("questions", { returnObjects: true }) as any;
    const banco = questionsData?.banco_questoes_disc_full || {};

    const categories = vacancy.vaga_soft_skill
      .map((vss) => softSkillToCategory[vss.soft_skill.nome])
      .filter(Boolean);
    const uniqueCategories = Array.from(new Set(categories));

    uniqueCategories.forEach((cat) => {
      if (banco[cat]) {
        DISC_METHODS.forEach((method) => {
          const pool = banco[cat][method];
          if (pool && pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            allBankQuestions.push({
              id: `${cat}-${method}-${Math.random()}`,
              text: pool[randomIndex],
              category: cat,
              method: method,
              originalIndex: randomIndex,
            });
          }
        });
      }
    });

    const selectedQuestions = shuffleArray(allBankQuestions).slice(0, MAX_BANK_QUESTIONS);

    if (vacancy.pergunta) {
      vacancy.pergunta
        .split("\n")
        .filter((q) => q.trim())
        .forEach((q, idx) => {
          selectedQuestions.push({
            id: `custom-${idx}-${Math.random()}`,
            text: q.trim(),
            category: "Personalizada",
            method: "N/A",
            isCustom: true,
          });
        });
    }

    setQuestions(selectedQuestions);
    setCurrentSection(0);
  }, [vacancy, t]);

  useEffect(() => {
    if (questions.length === 0) return;
    const questionsData = t("questions", { returnObjects: true }) as any;
    const banco = questionsData?.banco_questoes_disc_full || {};

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.isCustom || q.originalIndex === undefined) return q;
        const newText = banco[q.category]?.[q.method]?.[q.originalIndex];
        return newText && newText !== q.text ? { ...q, text: newText } : q;
      }),
    );
  }, [t, i18n.language]);

  const stateRef = useRef({ isFinished, isSubmitting, isStarted, showConfirmModal, showPenaltyModal });
  useEffect(() => {
    stateRef.current = { isFinished, isSubmitting, isStarted, showConfirmModal, showPenaltyModal };
  }, [isFinished, isSubmitting, isStarted, showConfirmModal, showPenaltyModal]);

  const handleScreenLeave = useCallback(() => {
    const { isFinished, isSubmitting, isStarted, showConfirmModal, showPenaltyModal } = stateRef.current;
    if (isFinished || isSubmitting || !isStarted || showConfirmModal || showPenaltyModal) return;

    setPenaltyCount((prev) => prev + 1);
    generateQuestions();
    setAnswers({});
    setShowPenaltyModal(true);
  }, [generateQuestions]);

  useEffect(() => {
    if (isStarted && !initializedRef.current) {
      generateQuestions();
      initializedRef.current = true;
    }

    const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleVisibilityChange = () => { if (document.hidden) handleScreenLeave(); };
    const handleWindowBlur = () => {
      setTimeout(() => {
        if (document.visibilityState === "hidden" || !document.hasFocus()) handleScreenLeave();
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

  const totalSections = Math.max(1, Math.ceil(questions.length / SECTION_SIZE));
  const sectionQuestions = questions.slice(
    currentSection * SECTION_SIZE,
    currentSection * SECTION_SIZE + SECTION_SIZE,
  );
  const isLastSection = currentSection === totalSections - 1;

  const sectionAnsweredCount = sectionQuestions.filter(
    (q) => (answers[q.id] || "").trim().length > 0,
  ).length;
  const allSectionAnswered = sectionAnsweredCount === sectionQuestions.length;

  const totalAnsweredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;
  const overallProgressPct = questions.length > 0 ? (totalAnsweredCount / questions.length) * 100 : 0;

  const isSectionComplete = (sectionIndex: number) => {
    const start = sectionIndex * SECTION_SIZE;
    const qs = questions.slice(start, start + SECTION_SIZE);
    return qs.length > 0 && qs.every((q) => (answers[q.id] || "").trim().length > 0);
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleNextSection = () => {
    if (!allSectionAnswered) { setShowIncompleteModal(true); return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentSection((prev) => prev + 1);
  };

  const handlePrevSection = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentSection((prev) => prev - 1);
  };

  const handleJumpToSection = (targetIndex: number) => {
    if (targetIndex >= currentSection) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentSection(targetIndex);
  };
  const handleConfirmSubmit = () => {
    if (!allSectionAnswered) { setShowIncompleteModal(true); return; }
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
      responses: questions.map((q) => ({
        question: q.text,
        answer: answers[q.id],
        category: q.category,
        method: q.method,
      })),
    };

    try {
      const res = await fetch("/api/vacancies/apply/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFinished(true);
      } else {
        throw new Error(t("assessment_error_sending"));
      }
    } catch (error) {
      console.error(error);
      alert(t("assessment_error_generic"));
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("assessment_success_title")}</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">{t("assessment_success_desc")}</p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 cursor-pointer"
          >
            {t("assessment_success_btn")}
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
          <h1 className="text-3xl font-bold text-slate-900 mb-6">{t("assessment_instructions_title")}</h1>
          <div className="space-y-6 text-slate-600 mb-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mt-1">
                  {n}
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{t(`assessment_rule_${n}_title`)}</p>
                  <p className="text-sm">{t(`assessment_rule_${n}_desc`)}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setIsStarted(true); setStartTime(Date.now()); }}
            className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>{t("assessment_start_btn")}</span>
            <Send size={18} />
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-medium">
            {t("assessment_timer_hint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  {t("assessment_section_label")}
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {currentSection + 1}
                  <span className="text-sm font-medium text-slate-400"> / {totalSections}</span>
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  {t("assessment_progress_answered")}
                </span>
                <span className="text-xl font-bold text-slate-900 leading-none">
                  {sectionAnsweredCount} / {sectionQuestions.length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                <Timer size={14} className="animate-pulse" />
                <span className="text-xs font-bold">
                  {Math.round(overallProgressPct)}% {t("assessment_progress_completed")}
                </span>
              </div>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)]"
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="h-24 lg:h-28" />

      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {totalSections > 1 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {Array.from({ length: totalSections }).map((_, i) => {
                const done = isSectionComplete(i);
                const isCurrent = i === currentSection;
                const isPast = i < currentSection;
                const clickable = isPast;

                return (
                  <div
                    key={i}
                    role={clickable ? "button" : undefined}
                    aria-label={clickable ? `Voltar para sessão ${i + 1}` : undefined}
                    onClick={() => clickable && handleJumpToSection(i)}
                    title={clickable ? `Editar sessão ${i + 1}` : undefined}
                    className={[
                      "flex items-center justify-center rounded-full font-bold text-xs transition-all duration-300",
                      isCurrent
                        ? "w-8 h-8 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                        : done
                          ? "w-7 h-7 bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 hover:scale-110 ring-2 ring-emerald-200"
                          : "w-7 h-7 bg-slate-200 text-slate-400",
                    ].join(" ")}
                  >
                    {done && !isCurrent ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                    {t("assessment_badge_interview")}
                  </span>
                  {totalSections > 1 && (
                    <span className="bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1">
                      <ListChecks size={11} />
                      {t("assessment_section_badge", { current: currentSection + 1, total: totalSections })}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{vacancy.cargo}</h1>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit size={16} />
                    <span>{sectionQuestions.length} {t("assessment_header_questions")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock size={16} />
                    <span>{t("assessment_header_secure")}</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Timer size={120} />
              </div>
            </div>

            <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start gap-4">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                {t("assessment_warning_box")}
              </p>
            </div>

            <div className="p-8 space-y-12">
              {sectionQuestions.map((q, index) => (
                <div key={q.id} className="group">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm">
                      {currentSection * SECTION_SIZE + index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-800 leading-snug pt-1">{q.text}</h3>
                  </div>
                  <textarea
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 hover:bg-white resize-none min-h-[120px] text-slate-700 leading-relaxed"
                    placeholder={t("assessment_answer_placeholder")}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex items-center">
                {currentSection > 0 ? (
                  <button
                    onClick={handlePrevSection}
                    className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                    {t("assessment_btn_prev")}
                  </button>
                ) : (
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <Clock size={16} />
                    <span>{t("assessment_footer_timer")}</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-auto">
                {isLastSection ? (
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <><Clock className="animate-spin" size={20} /><span>{t("assessment_btn_sending")}</span></>
                    ) : (
                      <><span>{t("assessment_btn_send")}</span><Send size={18} /></>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextSection}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200 cursor-pointer"
                  >
                    <span>{t("assessment_btn_next")}</span>
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showIncompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("attention_title")}</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {t("assessment_alert_answer_section", {
                  answered: sectionAnsweredCount,
                  total: sectionQuestions.length,
                })}
              </p>
              <button
                onClick={() => setShowIncompleteModal(false)}
                className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all active:scale-95 shadow-xl shadow-amber-200 cursor-pointer"
              >
                {t("answers_modal_close")}
              </button>
            </div>
          </div>
        )}

        {showPenaltyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("assessment_penalty_title")}</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">{t("assessment_penalty_desc")}</p>
              <button
                onClick={() => setShowPenaltyModal(false)}
                className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all active:scale-95 shadow-xl shadow-amber-200 cursor-pointer"
              >
                {t("assessment_penalty_btn")}
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("assessment_confirm_title")}</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">{t("assessment_confirm_desc")}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 cursor-pointer"
              >
                {t("assessment_confirm_btn_yes")}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-4 bg-white text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 border border-slate-200 cursor-pointer"
              >
                {t("assessment_confirm_btn_no")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
