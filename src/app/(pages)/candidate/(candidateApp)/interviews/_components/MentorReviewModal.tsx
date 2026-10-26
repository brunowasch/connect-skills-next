"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
    X,
    Share2,
    Download,
    Copy,
    CheckCircle2,
    MessageSquare,
    Brain,
    Globe,
    Linkedin,
    Activity,
    ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import { FaXTwitter } from "react-icons/fa6";

interface MentorReview {
    id: string;
    cargo: string;
    empresa: { nome_empresa: string; foto_perfil: string | null };
    mentor: { nome: string | null; sobrenome: string | null; foto_perfil: string | null } | null;
    data: string;
    hora_inicio: string;
    nota_comportamental: number | null;
    nota_tecnica: number | null;
    nota_geral: number | null;
    feedback_comportamental: string | null;
    feedback_tecnico: string | null;
    feedback_geral: string | null;
    feedback_enviado_em: string | null;
}

interface MentorReviewModalProps {
    review: MentorReview;
    candidateName: string;
    onClose: () => void;
}

export default function MentorReviewModal({ review, candidateName, onClose }: MentorReviewModalProps) {
    const { t } = useTranslation();
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [linkedinToast, setLinkedinToast] = useState(false);
    const [errorToast, setErrorToast] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    const avg = (() => {
        const vals = [review.nota_comportamental, review.nota_tecnica, review.nota_geral].filter((v): v is number => v !== null);
        if (!vals.length) return null;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    })();


    const shareText = t(
        "mentorship_review_share_text",
        {
            defaultValue:
                `Acabei de concluir uma sessão de mentoria técnica na vaga de {{cargo}} pela {{empresa}} no Connect Skills!\n\nMinha avaliação:\n- Comportamental: {{comp}}/100\n- Técnico: {{tech}}/100\n- Geral: {{geral}}/100\n\nO Connect Skills conecta candidatos a mentores especializados para acelerar sua jornada profissional.\n\n#ConnectSkills #Mentoria #Carreira #Tecnologia`,
            cargo: review.cargo,
            empresa: review.empresa.nome_empresa,
            comp: review.nota_comportamental ?? "-",
            tech: review.nota_tecnica ?? "-",
            geral: review.nota_geral ?? "-",
        }
    );

    const downloadCard = useCallback(async () => {
        if (!shareCardRef.current || downloading) return;
        setDownloading(true);
        try {
            const dataUrl = await toPng(shareCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                style: { margin: "0" }
            });
            const link = document.createElement("a");
            link.download = `connect-skills-mentoria-${review.id.slice(0, 8)}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Canvas draw error:", err);
            setErrorToast(true);
            setTimeout(() => setErrorToast(false), 5000);
        } finally {
            setDownloading(false);
        }
    }, [review, downloading]);

    const copyText = useCallback(() => {
        navigator.clipboard.writeText(shareText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    }, [shareText]);

    const shareLinkedIn = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareText);
        } catch (e) {
            console.error("Erro ao copiar o texto", e);
        }

        downloadCard();

        setLinkedinToast(true);
        setTimeout(() => setLinkedinToast(false), 12000);

        const newWin = window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank", "noopener,noreferrer");
        if (newWin) {
            window.focus();
        }
    }, [shareText, downloadCard]);

    const shareX = useCallback(() => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    }, [shareText]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >

            {linkedinToast && (
                <div className="fixed top-6 right-6 z-[60] bg-emerald-500 text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
                    <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm mb-1">Tudo pronto!</p>
                        <p className="text-emerald-50 text-[13px] leading-snug">
                            O texto foi copiado e a imagem foi baixada.<br />No LinkedIn: clique em <strong>Mídia</strong> para anexar a foto e cole o texto (<kbd className="bg-emerald-600 px-1 rounded font-mono text-[11px]">Ctrl+V</kbd>).
                        </p>
                    </div>
                </div>
            )}


            {errorToast && (
                <div className="fixed top-6 right-6 z-[60] bg-red-500 text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 max-w-sm animate-in slide-in-from-top-4 fade-in duration-300">
                    <X size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm mb-1">Aviso</p>
                        <p className="text-red-50 text-[13px] leading-snug">
                            Não foi possível baixar a imagem da avaliação.
                        </p>
                    </div>
                </div>
            )}

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => showShare ? setShowShare(false) : onClose()}
                                className="text-white hover:bg-white/20 p-1.5 -ml-1.5 rounded-lg transition-colors cursor-pointer"
                                aria-label="Voltar"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-white font-bold text-base leading-tight">
                                    {t("mentor_review_modal_title", { defaultValue: "Avaliação da Mentoria" })}
                                </h2>
                                <p className="text-blue-200 text-xs mt-0.5">{review.cargo}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    {!showShare ? (
                        <div className="p-6 space-y-5">

                            {review.mentor && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    {review.mentor.foto_perfil ? (
                                        <Image
                                            src={review.mentor.foto_perfil}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                            alt={review.mentor.nome ?? ""}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                            {(review.mentor.nome ?? "").charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">{t("mentor_review_mentor_label", { defaultValue: "Mentor" })}</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {review.mentor.nome} {review.mentor.sobrenome}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                                        <CheckCircle2 size={12} className="text-emerald-600" />
                                        <span className="text-[11px] font-semibold text-emerald-700">
                                            {t("mentor_review_completed", { defaultValue: "Concluída" })}
                                        </span>
                                    </div>
                                </div>
                            )}


                            {(review.nota_comportamental !== null || review.nota_tecnica !== null || review.nota_geral !== null) && (
                                <div className="grid grid-cols-1 gap-4">
                                    {review.nota_geral !== null && (
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
                                            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t('overall_score', 'Score Geral')}</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black text-slate-800">{review.nota_geral}</span>
                                                    <span className="text-sm text-slate-400">/100</span>
                                                </div>
                                                <div className={`mt-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md w-fit ${review.nota_geral >= 80 ? 'bg-green-100 text-green-700' :
                                                    review.nota_geral >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    <Activity size={12} />
                                                    {review.nota_geral >= 80 ? t('excellent_rating', 'Excelente') :
                                                        review.nota_geral >= 60 ? t('good_rating', 'Bom') :
                                                            t('regular_rating', 'Regular')}
                                                </div>
                                            </div>

                                            <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#3b82f6 ${review.nota_geral * 3.6}deg, #e2e8f0 0deg)` }}>
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <span className="font-bold text-blue-600">{review.nota_geral}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        {review.nota_comportamental !== null && (
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Globe size={16} className="text-purple-500" />
                                                    <span className="text-xs font-bold text-slate-600 uppercase">{t("mentor_review_score_behavioral", { defaultValue: "Comportamental" })}</span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800 mb-2">{review.nota_comportamental}%</div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${review.nota_comportamental}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {review.nota_tecnica !== null && (
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Brain size={16} className="text-emerald-500" />
                                                    <span className="text-xs font-bold text-slate-600 uppercase">{t("mentor_review_score_technical", { defaultValue: "Técnico" })}</span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800 mb-2">{review.nota_tecnica}%</div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${review.nota_tecnica}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            <div className="space-y-4">
                                {review.feedback_comportamental && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                            <Globe size={16} className="text-indigo-600" />
                                            <h3 className="font-bold text-slate-800 text-sm">{t("mentor_review_feedback_behavioral", { defaultValue: "Feedback Comportamental" })}</h3>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-slate-600 leading-relaxed text-sm">
                                                {review.feedback_comportamental}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {review.feedback_tecnico && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                            <Brain size={16} className="text-indigo-600" />
                                            <h3 className="font-bold text-slate-800 text-sm">{t("mentor_review_feedback_technical", { defaultValue: "Feedback Técnico" })}</h3>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-slate-600 leading-relaxed text-sm">
                                                {review.feedback_tecnico}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {review.feedback_geral && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                            <MessageSquare size={16} className="text-indigo-600" />
                                            <h3 className="font-bold text-slate-800 text-sm">{t("mentor_review_feedback_general", { defaultValue: "Feedback Geral" })}</h3>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-slate-600 leading-relaxed text-sm">
                                                {review.feedback_geral}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <button
                                onClick={() => setShowShare(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                            >
                                <Share2 size={16} />
                                {t("mentor_review_share_btn", { defaultValue: "Compartilhar Avaliação" })}
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-5">
                            <div
                                ref={shareCardRef}
                                className="rounded-2xl overflow-hidden select-none bg-white"
                                style={{
                                    padding: "28px",
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >

                                <div className="flex items-center gap-2 mb-5">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- capturado por html-to-image (toPng); next/image quebra a rasterização do card */}
                                    <img
                                        src="/img/logos/icon.svg"
                                        width={28}
                                        height={28}
                                        alt="Connect Skills"
                                        className="w-7 h-7 object-contain"
                                    />
                                </div>


                                <div className="bg-slate-50 rounded-xl p-5">
                                    <div className="flex items-start gap-4 mb-5">
                                        {review.empresa.foto_perfil ? (
                                            // eslint-disable-next-line @next/next/no-img-element -- capturado por html-to-image (toPng); next/image quebra a rasterização do card
                                            <img
                                                src={review.empresa.foto_perfil}
                                                width={52}
                                                height={52}
                                                className="w-[52px] h-[52px] rounded-xl object-cover border border-slate-200 flex-shrink-0"
                                                alt={review.empresa.nome_empresa}
                                            />
                                        ) : (
                                            <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 border border-slate-200">
                                                <span className="text-white text-xl font-black">
                                                    {review.empresa.nome_empresa.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-0.5">Mentoria Concluída</p>
                                            <h3 className="text-slate-900 font-black text-base leading-tight truncate">{review.cargo}</h3>
                                            <p className="text-blue-600 text-sm font-medium mt-0.5">{review.empresa.nome_empresa}</p>
                                        </div>
                                    </div>


                                    <div className="space-y-2.5">
                                        {review.nota_comportamental !== null && (
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-slate-600 text-[11px] font-semibold">Comportamental</span>
                                                    <span className="text-slate-900 font-black text-sm">{review.nota_comportamental}<span className="text-slate-400 text-xs font-normal">/100</span></span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${review.nota_comportamental}%`,
                                                            background: "linear-gradient(90deg, #8b5cf6, #6366f1)"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {review.nota_tecnica !== null && (
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-slate-600 text-[11px] font-semibold">Técnico</span>
                                                    <span className="text-slate-900 font-black text-sm">{review.nota_tecnica}<span className="text-slate-400 text-xs font-normal">/100</span></span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${review.nota_tecnica}%`,
                                                            background: "linear-gradient(90deg, #3b82f6, #06b6d4)"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {review.nota_geral !== null && (
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-slate-600 text-[11px] font-semibold">Geral</span>
                                                    <span className="text-slate-900 font-black text-sm">{review.nota_geral}<span className="text-slate-400 text-xs font-normal">/100</span></span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${review.nota_geral}%`,
                                                            background: "linear-gradient(90deg, #10b981, #34d399)"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {avg !== null && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                                            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Média Geral</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900">{avg}</span>
                                                <span className="text-slate-400 text-sm">/100</span>
                                            </div>
                                        </div>
                                    )}
                                </div>


                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-slate-500 text-[11px] font-medium">{candidateName}</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-slate-500 text-[10px] font-medium">connectskills.com.br</span>
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={downloadCard}
                                    disabled={downloading}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Download size={15} className={downloading ? "animate-bounce" : ""} />
                                    {downloading
                                        ? "Gerando..."
                                        : t("mentor_review_download", { defaultValue: "Salvar Imagem" })
                                    }
                                </button>
                                <button
                                    onClick={copyText}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition active:scale-95 cursor-pointer ${copied ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                                >
                                    {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                                    {copied
                                        ? t("mentor_review_copied", { defaultValue: "Copiado!" })
                                        : t("mentor_review_copy_text", { defaultValue: "Copiar Texto" })
                                    }
                                </button>
                            </div>


                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    {t("mentor_review_share_on", { defaultValue: "Compartilhar em" })}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={shareLinkedIn}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0077b5] text-white text-sm font-semibold hover:bg-[#006097] transition active:scale-95 cursor-pointer"
                                    >
                                        <Linkedin size={15} />
                                        LinkedIn
                                    </button>
                                    <button
                                        onClick={shareX}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition active:scale-95 cursor-pointer"
                                    >
                                        <FaXTwitter size={15} />
                                        X (Twitter)
                                    </button>
                                </div>
                            </div>


                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {t("mentor_review_post_text_preview", { defaultValue: "Texto pronto para publicar" })}
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{shareText}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
