"use client";

import { useState, useEffect, useRef } from "react";
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
import questionsData from "@/src/data/questions.json";

interface Question {
    id: string;
    text: string;
    category: string;
    method: string;
    isCustom?: boolean;
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
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [startTime] = useState<number>(Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [penaltyCount, setPenaltyCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial question generation
    useEffect(() => {
        generateQuestions();

        // Disable Copy/Paste
        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            alert("Copiar e colar não é permitido nesta avaliação.");
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Screen Visibility / Blur detection
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                handleScreenLeave();
            }
        };

        const handleBlur = () => {
            handleScreenLeave();
        };

        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    const generateQuestions = () => {
        const selectedQuestions: Question[] = [];
        const banco = questionsData.banco_questoes_disc_full as any;

        // Get categories from vacancy soft skills
        const categories = vacancy.vaga_soft_skill.map(vss => softSkillToCategory[vss.soft_skill.nome]).filter(Boolean);
        const uniqueCategories = Array.from(new Set(categories));

        uniqueCategories.forEach(cat => {
            if (banco[cat]) {
                DISC_METHODS.forEach(method => {
                    const pool = banco[cat][method];
                    if (pool && pool.length > 0) {
                        const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
                        selectedQuestions.push({
                            id: `${cat}-${method}-${Math.random()}`,
                            text: randomQuestion,
                            category: cat,
                            method: method
                        });
                    }
                });
            }
        });

        // Add custom company questions
        if (vacancy.pergunta) {
            const customQuestions = vacancy.pergunta.split('\n').filter(q => q.trim());
            customQuestions.forEach((q, idx) => {
                selectedQuestions.push({
                    id: `custom-${idx}`,
                    text: q.trim(),
                    category: "Personalizada",
                    method: "N/A",
                    isCustom: true
                });
            });
        }

        setQuestions(selectedQuestions);
    };

    const handleScreenLeave = () => {
        setPenaltyCount(prev => prev + 1);
        generateQuestions(); // Change questions as per requirement
        setAnswers({}); // Reset answers because questions changed
        alert("Atenção: Você saiu da tela de avaliação. Por segurança, suas perguntas foram alteradas e seu progresso resetado.");
    };

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        // Enforce all questions answered
        const answeredCount = Object.keys(answers).length;
        if (answeredCount < questions.length) {
            alert(`Por favor, responda todas as ${questions.length} perguntas antes de enviar.`);
            return;
        }

        setIsSubmitting(true);
        const endTime = Date.now();
        const durationSeconds = Math.floor((endTime - startTime) / 1000);

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
                throw new Error("Erro ao enviar respostas.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar candidatura. Tente novamente.");
        } finally {
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
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Candidatura Enviada!</h1>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Sua entrevista foi concluída com sucesso. Nossos recrutadores e nossa IA analisarão seu perfil e entrarão em contato em breve.
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                    >
                        Fechar Janela
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
                    {/* Header */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-blue-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">Entrevista Técnica</span>
                                <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                                    <ShieldAlert size={14} className="text-amber-400" />
                                    <span>Ambiente em Lockdown</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{vacancy.cargo}</h1>
                            <div className="flex items-center gap-4 text-slate-400 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <BrainCircuit size={16} />
                                    <span>{questions.length} Questões</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Lock size={16} />
                                    <span>Seguro e Privado</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Timer size={120} />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-100 w-full">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* Warning Box */}
                    <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start gap-4">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Não saia desta janela e não utilize comandos de copiar/colar.
                            Detectamos sua atividade e a saída da tela mudará suas perguntas automaticamente.
                        </p>
                    </div>

                    {/* Questions List */}
                    <div className="p-8 space-y-12">
                        {questions.map((q, index) => (
                            <div key={q.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
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
                                    placeholder="Escreva sua resposta detalhadamente..."
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    autoComplete="off"
                                />
                                <div className="mt-2 flex justify-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                        {q.isCustom ? "Específica da Empresa" : `Perfil ${q.method}`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-slate-500 text-sm flex items-center gap-2">
                            <Clock size={16} />
                            <span>Contabilizando tempo de resposta...</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Clock className="animate-spin" size={20} />
                                    <span>Analisando com IA...</span>
                                </>
                            ) : (
                                <>
                                    <span>Enviar Candidatura</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm">
                    © 2024 Connect Skills - Recrutamento Direcionado por Inteligência Artificial
                </p>
            </div>
        </div>
    );
}
