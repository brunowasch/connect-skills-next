"use client";

import { X, CheckCircle2, XCircle, Send, Sparkles, AlertTriangle, Wand2, Calendar, MapPin, Briefcase, DollarSign } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

interface FinalDecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateName: string;
    candidateId: string;
    vacancyId: string;
    vacancyTitle: string;
    onSubmit: (data: ProposalData) => Promise<void>;
    vacancyDetails?: {
        salario?: number | null;
        moeda?: string | null;
        tipo_local_trabalho?: string | null;
        cidade?: string | null;
        estado?: string | null;
    } | null;
}

export interface ProposalData {
    status: 'APPROVED' | 'REJECTED';
    salario?: number;
    moeda?: string;
    data_inicio?: string;
    modelo_trabalho?: string;
    localizacao?: string;
    mensagem: string;
}

interface FeedbackAnalysis {
    quality: number;
    acceptable: boolean;
    corrected: string | null;
    cause: string | null;
}

type SubmitStep = 'idle' | 'analyzing' | 'blocked' | 'ready' | 'submitting';

function QualityBadge({ quality }: { quality: number }) {
    const { t } = useTranslation();
    if (quality >= 50) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                Bom ({quality}/100)
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            <XCircle size={12} />
            Ruim ({quality}/100)
        </span>
    );
}

export function FinalDecisionModal({ isOpen, onClose, candidateName, candidateId, vacancyId, vacancyTitle, onSubmit, vacancyDetails }: FinalDecisionModalProps) {
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [mensagem, setMensagem] = useState("");
    const [salario, setSalario] = useState("");
    const [salarioDisplay, setSalarioDisplay] = useState("");
    const [moeda, setMoeda] = useState("BRL");
    const [dataInicio, setDataInicio] = useState("");
    const [modeloTrabalho, setModeloTrabalho] = useState("Presencial");
    const [localizacao, setLocalizacao] = useState("");

    const isSalarioFixed = !!vacancyDetails?.salario;
    const isModeloTrabalhoFixed = !!vacancyDetails?.tipo_local_trabalho;
    const isLocalizacaoFixed = !!(vacancyDetails?.cidade && vacancyDetails?.estado);

    const [isPending, startTransition] = useTransition();

    const [step, setStep] = useState<SubmitStep>('idle');
    const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    const formatSalarioDisplay = (raw: string, currency: string) => {
        const num = parseFloat(raw.replace(/[^0-9,]/g, '').replace(',', '.'));
        if (isNaN(num)) return raw;
        const locale = currency === 'BRL' ? 'pt-BR' : currency === 'EUR' ? 'de-DE' : 'en-US';
        return num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStatus(null);
            setMensagem("");
            const initialSalario = vacancyDetails?.salario ? String(vacancyDetails.salario) : "";
            setSalario(initialSalario);
            setSalarioDisplay(initialSalario ? formatSalarioDisplay(initialSalario, vacancyDetails?.moeda || 'BRL') : "");
            setMoeda(vacancyDetails?.moeda || "BRL");
            setDataInicio("");
            setModeloTrabalho(vacancyDetails?.tipo_local_trabalho || "Presencial");
            setLocalizacao((vacancyDetails?.cidade && vacancyDetails?.estado) ? `${vacancyDetails.cidade}, ${vacancyDetails.estado}` : "");
            setStep('idle');
            setAnalysis(null);
            setAnalysisError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const resetAnalysis = () => {
        if (step !== 'idle' && step !== 'analyzing') {
            setStep('idle');
            setAnalysis(null);
            setAnalysisError(null);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDataInicio(value);
        if (!value) {
            setDateError(null);
            return;
        }
        const selected = new Date(`${value}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            setDateError('Data de início inválida!');
        } else {
            setDateError(null);
        }
    };

    const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove tudo que não for dígito ou vírgula/ponto
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (raw === '') {
            setSalario('');
            setSalarioDisplay('');
            return;
        }
        // Guarda o valor numérico puro (sem formatação) para submissão
        const numericValue = (parseInt(raw, 10) / 100).toFixed(2);
        setSalario(String(parseFloat(numericValue)));
        // Formata para exibição
        const locale = moeda === 'BRL' ? 'pt-BR' : moeda === 'EUR' ? 'de-DE' : 'en-US';
        const formatted = parseFloat(numericValue).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        setSalarioDisplay(formatted);
    };

    const handleAnalyze = async () => {
        if (!status) {
            toast.error("Selecione um status");
            return;
        }
        if (!mensagem.trim() || mensagem.length < 40) {
            toast.error("O feedback precisa ter pelo menos 40 caracteres.");
            return;
        }

        if (status === 'APPROVED') {
            if (!salario || !dataInicio || !localizacao) {
                toast.error("Preencha todos os campos da proposta.");
                return;
            }
            if (dateError) {
                toast.error(dateError);
                return;
            }
        }

        setStep('analyzing');
        setAnalysis(null);
        setAnalysisError(null);

        try {
            const res = await fetch('/api/ai/check-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile: 'company', feedback: mensagem, language: i18n.language.split('-')[0] }),
            });

            if (!res.ok) throw new Error(`AI service error: ${res.status}`);

            const data: FeedbackAnalysis = await res.json();
            setAnalysis(data);
            setStep(data.acceptable ? 'ready' : 'blocked');
        } catch (err) {
            console.error('Feedback analysis error:', err);
            setAnalysisError("Não foi possível analisar o feedback. Tente novamente.");
            setStep('idle');
        }
    };

    const handleConfirmSubmit = () => {
        if (!status || step !== 'ready') return;

        setStep('submitting');
        startTransition(async () => {
            try {
                await onSubmit({
                    status,
                    mensagem,
                    ...(status === 'APPROVED' ? {
                        salario: Number(salario),
                        moeda,
                        data_inicio: dataInicio,
                        modelo_trabalho: modeloTrabalho,
                        localizacao
                    } : {})
                });
                toast.success("Decisão final enviada com sucesso!");
                onClose();
            } catch {
                toast.error("Erro ao enviar decisão final.");
                setStep('ready');
            }
        });
    };

    const handleUseCorrectedText = () => {
        if (!analysis?.corrected) return;
        setMensagem(analysis.corrected);
        setStep('idle');
        setAnalysis(null);
        setAnalysisError(null);
    };

    if (!isOpen) return null;

    const isAnalyzing = step === 'analyzing';
    const isBusy = isAnalyzing || step === 'submitting';
    const canEdit = !isBusy;
    const primaryButton = (() => {
        if (step === 'idle') return { label: 'Verificar com IA', action: handleAnalyze };
        if (step === 'analyzing') return { label: 'Verificando...', action: () => { } };
        if (step === 'blocked') return { label: 'Corrija a mensagem', action: () => { } };
        if (step === 'ready') return { label: 'Confirmar e Enviar', action: handleConfirmSubmit };
        if (step === 'submitting') return { label: 'Enviando...', action: () => { } };
        return { label: 'Enviar Decisão', action: handleAnalyze };
    })();

    const isSubmitDisabled =
        !status ||
        mensagem.length < 40 ||
        (status === 'APPROVED' && (!salario || !dataInicio || !localizacao)) ||
        isBusy ||
        step === 'blocked';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div>
                        <h2 className="text-xl font-bold text-indigo-900">Decisão Final</h2>
                        <p className="text-sm text-indigo-700 mt-1">Candidato: {candidateName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer" disabled={isBusy}>
                            <X size={24} className="text-indigo-800" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Qual é a sua decisão final?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => { setStatus('APPROVED'); resetAnalysis(); }}
                                disabled={isBusy}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${status === 'APPROVED'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-600'
                                    } disabled:opacity-50`}
                            >
                                <CheckCircle2 size={32} className={status === 'APPROVED' ? 'text-emerald-600' : 'text-slate-400'} />
                                <span className="mt-2 font-bold text-center">Aprovar &amp; <br /> Enviar Proposta</span>
                            </button>

                            <button
                                onClick={() => { setStatus('REJECTED'); resetAnalysis(); }}
                                disabled={isBusy}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${status === 'REJECTED'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                                    : 'border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 text-slate-600'
                                    } disabled:opacity-50`}
                            >
                                <XCircle size={32} className={status === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'} />
                                <span className="mt-2 font-bold text-center">Reprovar <br /> (Não Selecionado)</span>
                            </button>
                        </div>
                    </div>

                    {/* Proposal Form */}
                    {status === 'APPROVED' && (
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Briefcase size={18} className="text-indigo-600" />
                                Detalhes da Proposta
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                        <DollarSign size={14} /> Salário Mensal
                                    </label>
                                    <div className="flex">
                                        <select
                                            value={moeda} onChange={e => setMoeda(e.target.value)} disabled={!canEdit || isSalarioFixed}
                                            className="px-3 py-2 bg-white border border-r-0 border-slate-300 rounded-l-lg text-sm font-medium outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                        >
                                            <option value="BRL">R$</option>
                                            <option value="USD">U$</option>
                                            <option value="EUR">€</option>
                                        </select>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={salarioDisplay}
                                            onChange={handleSalarioChange}
                                            disabled={!canEdit || isSalarioFixed}
                                            placeholder="Ex: 5.000,00"
                                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                        <Calendar size={14} /> Data de Início
                                    </label>
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleDateChange}
                                        disabled={!canEdit}
                                        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm outline-none focus:ring-1 transition-colors
                                            ${dateError
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                    />
                                    {dateError && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertTriangle size={11} />
                                            {dateError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                        <MapPin size={14} /> Modelo de Trabalho
                                    </label>
                                    <select
                                        value={modeloTrabalho}
                                        onChange={e => setModeloTrabalho(e.target.value)}
                                        disabled={!canEdit || isModeloTrabalhoFixed}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                    >
                                        <option value="Presencial">Presencial</option>
                                        <option value="H_brido">Híbrido</option>
                                        <option value="Híbrido">Híbrido</option>
                                        <option value="Home_Office">Home Office</option>
                                        <option value="Home Office">Home Office</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                        <MapPin size={14} /> Localização
                                    </label>
                                    <input
                                        type="text"
                                        value={localizacao}
                                        onChange={e => setLocalizacao(e.target.value)}
                                        disabled={!canEdit || isLocalizacaoFixed}
                                        placeholder="Ex: São Paulo, SP ou Remoto"
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback Message */}
                    {status && (
                        <div className="animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    {status === 'APPROVED' ? 'Mensagem de Boas-Vindas & Feedback' : 'Feedback da Reprovação'} <span className="text-rose-500">*</span>
                                </label>
                            </div>

                            <textarea
                                value={mensagem}
                                onChange={(e) => {
                                    setMensagem(e.target.value);
                                    resetAnalysis();
                                }}
                                disabled={!canEdit}
                                placeholder={
                                    status === 'APPROVED'
                                        ? "Parabéns! Estamos muito felizes em oferecer esta proposta..."
                                        : "Infelizmente você não foi selecionado desta vez. Seu perfil..."
                                }
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none resize-none h-32 text-sm transition-colors
                                    ${!canEdit
                                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                                        : step === 'blocked'
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                                            : step === 'ready'
                                                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
                                                : mensagem.length > 0 && mensagem.length < 40
                                                    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-200'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'
                                    }`}
                            />
                            <div className="flex justify-between items-center mt-1.5">
                                <div>
                                    {analysis && <QualityBadge quality={analysis.quality} />}
                                </div>
                                <span className={`text-xs font-medium transition-colors ${mensagem.length > 0 && mensagem.length < 40 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {mensagem.length} / 40 caracteres
                                </span>
                            </div>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="flex items-center gap-3 text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                            <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin shrink-0" />
                            Analisando mensagem com IA...
                        </div>
                    )}

                    {analysisError && (
                        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            {analysisError}
                        </div>
                    )}

                    {step === 'blocked' && analysis && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3 animate-in fade-in">
                            <div className="flex items-start gap-2">
                                <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-rose-700">
                                        Mensagem não pode ser enviada
                                    </p>
                                    {analysis.cause && (
                                        <p className="text-xs text-rose-600 mt-1">
                                            Motivo: {analysis.cause}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'ready' && analysis && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3 animate-in fade-in">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700">
                                        Mensagem aprovada pela IA
                                    </p>
                                    <p className="text-xs text-emerald-600 mt-0.5">
                                        Clique em "Confirmar e Enviar" para finalizar a decisão.
                                    </p>
                                </div>
                            </div>

                            {analysis.corrected && analysis.corrected.trim() !== mensagem.trim() && (
                                <div className="space-y-2 pt-2 border-t border-emerald-200/50">
                                    <p className="text-xs font-semibold text-emerald-700">
                                        Versão melhorada pela IA (opcional):
                                    </p>
                                    <div className="text-xs text-slate-700 bg-white border border-emerald-100 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                                        {analysis.corrected}
                                    </div>
                                    <button
                                        onClick={handleUseCorrectedText}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                                    >
                                        <Wand2 size={12} />
                                        Usar texto sugerido
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isBusy}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={primaryButton.action}
                        disabled={isSubmitDisabled}
                        className={`px-6 py-2 rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${step === 'ready'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        {(isAnalyzing || step === 'submitting') && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {step === 'idle' && <Sparkles size={16} />}
                        {step === 'ready' && <Send size={16} />}
                        {primaryButton.label}
                    </button>
                </div>
            </div>
        </div>
    );
}
