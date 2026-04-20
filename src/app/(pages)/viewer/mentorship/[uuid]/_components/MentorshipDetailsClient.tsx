"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Building2, Calendar, Clock, MapPin, Video, ArrowLeft, Briefcase, CheckCircle, AlertTriangle, XCircle, User, FileText, Copy, Check } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";


export default function MentorshipDetailsClient({ mentorship }: { mentorship: any }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [linkCopied, setLinkCopied] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    const handleConfirmMentorship = async () => {
        try {
            setIsConfirming(true);
            const res = await fetch("/api/mentor/interview", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entrevistaId: mentorship.id,
                    action: "CONFIRM"
                })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Erro ao confirmar mentoria.");
                return;
            }

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro interno ao confirmar.");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancelMentorship = async () => {
        if (!confirm(t("mentorship_details_cancel_confirm", { defaultValue: "Tem certeza que deseja recusar esta mentoria?" }))) return;
        try {
            setIsCanceling(true);
            const res = await fetch("/api/mentor/interview", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entrevistaId: mentorship.id,
                    action: "CANCEL"
                })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Erro ao recusar mentoria.");
                return;
            }

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro interno ao recusar.");
        } finally {
            setIsCanceling(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            const companyUuid = mentorship?.empresa?.uuid;
            const url = companyUuid
                ? `${window.location.origin}/viewer/company/${companyUuid}`
                : window.location.href;
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Erro ao copiar link:', err);
        }
    };

    const { status, data, hora_inicio, hora_fim, criado_em, vaga, empresa, mentor } = mentorship;

    let statusColor = "bg-gray-100 text-gray-800 border-gray-200";
    let statusText = status;

    if (status === 'CONFIRMADA') {
        statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        statusText = t("mentorship_status_confirmed");
    } else if (status === 'CONCLUIDA') {
        statusColor = "bg-blue-50 text-blue-700 border-blue-200";
        statusText = t("mentorship_status_completed");
    } else if (status === 'PENDENTE_CANDIDATO') {
        statusColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
        statusText = t("mentorship_status_pending");
    } else if (status === 'RECUSADA') {
        statusColor = "bg-red-50 text-red-700 border-red-200";
        statusText = t("mentorship_status_declined");
    } else if (status === 'CANCELADA') {
        statusColor = "bg-red-50 text-red-700 border-red-200";
        statusText = t("mentorship_status_cancelled");
    } else if (status === 'EXPIRADA') {
        statusColor = "bg-orange-50 text-orange-700 border-orange-200";
        statusText = t("mentorship_status_expired");
    }

    const isScheduled = status === 'CONFIRMADA';
    
    const formattedData = data ? format(new Date(`${data}T00:00:00`), 'dd/MM/yyyy') : '---';
    const cargoTitle = vaga?.cargo || "Mentoria";

    const vinculoMap: Record<string, string> = {
        Estagio: "Estágio",
        CLT_Tempo_Integral: "CLT - Tempo Integral",
        CLT_Meio_Periodo: "CLT - Meio Período",
        Trainee: "Trainee",
        Aprendiz: "Aprendiz",
        PJ: "PJ",
        Freelancer_Autonomo: "Freelancer / Autônomo",
        Temporario: "Temporário",
    };

    const displayVinculo = vaga?.vinculo_empregaticio ? (vinculoMap[vaga.vinculo_empregaticio] || vaga.vinculo_empregaticio) : null;
    const isRemote = vaga?.tipo_local_trabalho === 'Home_Office';
    const displayLocation = isRemote ? 'Home Office' : (empresa?.cidade ? `${empresa.cidade}${empresa.estado ? `, ${empresa.estado}` : ''}` : null);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Área */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            {t("mentorship_details_back", { defaultValue: 'Voltar' })}
                        </button>
                    </div>

                    <div className="flex items-start gap-3 mb-6">
                        {empresa?.foto_perfil ? (
                            <Image
                                src={empresa.foto_perfil}
                                alt={empresa?.nome_empresa || "Empresa"}
                                width={64}
                                height={64}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200 shadow-sm flex-shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <Building2 size={24} className="text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2 mb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                            {cargoTitle}
                                        </h1>
                                        <p className="text-base text-gray-600 mt-1">
                                            {empresa?.nome_empresa || "Empresa"}
                                        </p>
                                    </div>
                                    {/* Desktop: copy + language + status */}
                                    <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={handleCopyLink}
                                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer group relative"
                                            title="Copiar link da mentoria"
                                        >
                                            {linkCopied ? (
                                                <Check size={16} className="text-green-600" />
                                            ) : (
                                                <Copy size={16} className="text-gray-600 group-hover:text-gray-900" />
                                            )}
                                        </button>
                                        <LanguageSwitcher />
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap shadow-sm ${statusColor}`}>
                                            {status === 'CONFIRMADA' && <CheckCircle size={14} />}
                                            {status === 'CONCLUIDA' && <CheckCircle size={14} />}
                                            {status === 'PENDENTE_CANDIDATO' && <AlertTriangle size={14} />}
                                            {(status === 'CANCELADA' || status === 'RECUSADA' || status === 'EXPIRADA') && <XCircle size={14} />}
                                            {statusText}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile: copy + language + status */}
                                <div className="flex lg:hidden items-center gap-2 flex-wrap">
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer group relative"
                                        title="Copiar link da mentoria"
                                    >
                                        {linkCopied ? (
                                            <Check size={15} className="text-green-600" />
                                        ) : (
                                            <Copy size={15} className="text-gray-600 group-hover:text-gray-900" />
                                        )}
                                    </button>
                                    <LanguageSwitcher />
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] sm:text-xs font-semibold whitespace-nowrap shadow-sm ${statusColor}`}>
                                        {status === 'CONFIRMADA' && <CheckCircle size={13} />}
                                        {status === 'CONCLUIDA' && <CheckCircle size={13} />}
                                        {status === 'PENDENTE_CANDIDATO' && <AlertTriangle size={13} />}
                                        {(status === 'CANCELADA' || status === 'RECUSADA' || status === 'EXPIRADA') && <XCircle size={13} />}
                                        {statusText}
                                    </span>
                                </div>
                            </div> {/* fecha flex flex-col gap-2 mb-2 */}
                            
                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                                {isRemote !== null && (
                                    <div className="flex items-center gap-1.5">
                                        <Building2 size={15} className="text-gray-400" />
                                        <span>{isRemote ? t("mentorship_details_home_office", { defaultValue: 'Home Office' }) : t("mentorship_details_presential", { defaultValue: 'Presencial' })}</span>
                                    </div>
                                )}
                                {displayLocation && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={15} className="text-gray-400" />
                                        <span>{displayLocation}</span>
                                    </div>
                                )}
                                {displayVinculo && (
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase size={15} className="text-gray-400" />
                                        <span>{displayVinculo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Detalhes */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Dicas e Preparação */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="text-blue-600" size={20} />
                                {t("mentorship_details_how_it_works", { defaultValue: 'Como funciona sua avaliação técnica?' })}
                            </h2>
                            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                                <p className="mb-4">
                                    {t("mentorship_details_intro_1", { defaultValue: 'Nesta etapa, você conversará com um especialista (mentor) que conduzirá sua avaliação técnica para a ' })}
                                    <strong>{empresa?.nome_empresa || t("mentorship_details_company", { defaultValue: 'Empresa' })}</strong>
                                    {t("mentorship_details_intro_2", { defaultValue: '. O objetivo é conhecer a fundo suas habilidades e entender o seu alinhamento aos requisitos técnicos e culturais da vaga.' })}
                                </p>
                                <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">{t("mentorship_details_tips_title", { defaultValue: 'Dicas rápidas para ir bem:' })}</h3>
                                <ul className="space-y-3 mb-6 bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
                                    <li className="flex gap-3">
                                        <div className="mt-1 h-5 w-5 bg-white border border-blue-200 rounded-full flex items-center justify-center font-bold text-xs text-blue-600 shadow-sm shrink-0">1</div>
                                        <span><strong>{t("mentorship_details_tip1_title", { defaultValue: 'Ambiente e hardware:' })}</strong> {t("mentorship_details_tip1_desc", { defaultValue: 'Escolha um local silencioso, bem iluminado e com internet estável. Teste sua câmera e microfone previamente, pois o contato visual é muito importante para a avaliação.' })}</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 h-5 w-5 bg-white border border-blue-200 rounded-full flex items-center justify-center font-bold text-xs text-blue-600 shadow-sm shrink-0">2</div>
                                        <span><strong>{t("mentorship_details_tip2_title", { defaultValue: 'Prepare-se tecnicamente:' })}</strong> {t("mentorship_details_tip2_desc", { defaultValue: 'Esteja pronto para detalhar projetos anteriores, decisões arquiteturais que tomou, e as ferramentas com as quais possui maior proficiência técnica.' })}</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 h-5 w-5 bg-white border border-blue-200 rounded-full flex items-center justify-center font-bold text-xs text-blue-600 shadow-sm shrink-0">3</div>
                                        <span><strong>{t("mentorship_details_tip3_title", { defaultValue: 'Postura e pontualidade:' })}</strong> {t("mentorship_details_tip3_desc", { defaultValue: 'Trate esta sessão com a mesma seriedade de uma etapa presencial de contratação. Acesse o link da entrevista com pelo menos 5 minutos de antecedência.' })}</span>
                                    </li>
                                </ul>
                                <p className="text-gray-500 italic mt-4 text-sm">
                                    {t("mentorship_details_footer_tip", { defaultValue: 'Lembre-se: o especialista fará uma recomendação direta para a empresa com base neste encontro. Aja com naturalidade, seja você mesmo e mostre todo o seu potencial. Boa sorte!' })}
                                </p>
                            </div>
                        </div>

                        {/* Detalhes da Vaga Relacionada (Secundário) */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <details className="group cursor-pointer">
                                <summary className="flex items-center justify-between font-bold text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="text-slate-500" size={18} />
                                        {t("mentorship_details_recall_vacancy", { defaultValue: 'Relembrar Descrição da Vaga' })}
                                    </div>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-gray-100 prose prose-sm text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                    {vaga?.descricao ? (
                                        vaga.descricao
                                    ) : (
                                        <p className="text-gray-400 italic">{t("mentorship_details_no_description", { defaultValue: 'Nenhuma descrição fornecida para esta vaga.' })}</p>
                                    )}
                                </div>
                            </details>
                        </div>
                    </div>

                    {/* Right Column - Informações */}
                    <div className="space-y-6">
                        {/* Status da Mentoria */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t("mentorship_details_info_title", { defaultValue: 'Informações da Mentoria' })}</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">{t("mentorship_details_scheduled_date", { defaultValue: 'Data Agendada' })}</p>
                                        <p className="text-sm font-semibold text-gray-900">{formattedData}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">{t("mentorship_details_time", { defaultValue: 'Horário' })}</p>
                                        <p className="text-sm font-semibold text-gray-900">{hora_inicio} - {hora_fim}</p>
                                    </div>
                                </div>
                            </div>

                            {isScheduled && (
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <a 
                                        href={mentorship.link_reuniao || "#"} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-bold shadow-sm cursor-pointer"
                                    >
                                        <Video size={16} />
                                        {t("mentorship_meeting_link", { defaultValue: "Acessar Reunião" })}
                                    </a>
                                </div>
                            )}
                            {status === 'PENDENTE_CANDIDATO' && (
                                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-3">
                                    <button 
                                        onClick={handleConfirmMentorship}
                                        disabled={isConfirming || isCanceling}
                                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-bold shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {isConfirming ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        ) : (
                                            <CheckCircle size={16} />
                                        )}
                                        {t("mentorship_accept_btn", { defaultValue: "Confirmar Presença" })}
                                    </button>
                                    <button 
                                        onClick={handleCancelMentorship}
                                        disabled={isConfirming || isCanceling}
                                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition font-bold shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {isCanceling ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                                        ) : (
                                            <XCircle size={16} />
                                        )}
                                        {t("mentorship_decline_btn", { defaultValue: "Recusar" })}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    );
}
