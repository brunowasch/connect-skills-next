"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, Calendar, Clock, MapPin } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

interface Props {
    entrevistaId: string;
    status: string;
    vagaTitle: string;
    companyName: string;
    companyPhoto: string | null;
    date: string;
    horaInicio: string;
}

export default function ConfirmOnsiteInterviewClient({
    entrevistaId,
    status,
    vagaTitle,
    companyName,
    companyPhoto,
    date,
    horaInicio,
}: Props) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);
    const [error, setError] = useState("");

    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    if (status === "NOT_FOUND") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-10 p-4 min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center border border-gray-100">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {t("onsite_confirm_not_found_title", "Entrevista não encontrada")}
                    </h1>
                    <p className="text-gray-500">
                        {t("onsite_confirm_not_found_desc", "Este link pode ser inválido ou expirado.")}
                    </p>
                </div>
            </div>
        );
    }

    if (currentStatus === "CONFIRMADA") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-10 p-4 min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center border border-green-100">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("onsite_confirm_success_title", "Presença Confirmada!")}
                    </h1>
                    <div className="text-gray-600 mb-2">
                        <Trans i18nKey="onsite_confirm_success_desc" values={{ company: companyName, job: vagaTitle }}>
                            Sua entrevista presencial na <strong>{companyName}</strong> para a vaga de <strong>{vagaTitle}</strong> foi confirmada.
                        </Trans>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 my-4 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-gray-800">{date}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-gray-800">{horaInicio}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-gray-800">{companyName}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        {t("onsite_confirm_success_hint", "Os detalhes foram enviados para seu e-mail. A empresa entrará em contato com o endereço e informações adicionais.")}
                    </p>
                    <button
                        onClick={() => router.push("/candidate/dashboard")}
                        className="w-full px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                        {t("interview_confirm_back_dashboard", "Ir para o Dashboard")}
                    </button>
                </div>
            </div>
        );
    }

    if (currentStatus === "CANCELADA") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-10 p-4 min-h-[60vh]">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center border border-gray-100">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {t("onsite_confirm_declined_title", "Entrevista Recusada")}
                    </h1>
                    <p className="text-gray-500 mb-6">
                        {t("onsite_confirm_declined_desc", "Você recusou este convite de entrevista presencial. A empresa foi notificada.")}
                    </p>
                    <button
                        onClick={() => router.push("/candidate/dashboard")}
                        className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        {t("interview_confirm_back_dashboard", "Voltar para o Dashboard")}
                    </button>
                </div>
            </div>
        );
    }

    const handleConfirm = async () => {
        setIsConfirming(true);
        setError("");
        try {
            const res = await fetch("/api/company/onsite-interview", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entrevistaId, action: "CONFIRM" }),
            });
            const data = await res.json();
            if (data.success) {
                setCurrentStatus("CONFIRMADA");
                router.refresh();
            } else {
                setError(data.error || t("error_general", "Erro ao confirmar. Tente novamente."));
            }
        } catch {
            setError(t("error_connection", "Erro de conexão. Tente novamente."));
        } finally {
            setIsConfirming(false);
        }
    };

    const handleDecline = async () => {
        if (!confirm(t("onsite_confirm_prompt_decline", "Tem certeza que deseja recusar este convite de entrevista presencial?"))) return;

        setIsDeclining(true);
        setError("");
        try {
            const res = await fetch("/api/company/onsite-interview", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entrevistaId, action: "CANCEL" }),
            });
            const data = await res.json();
            if (data.success) {
                setCurrentStatus("CANCELADA");
                router.refresh();
            } else {
                setError(data.error || t("error_general", "Erro ao recusar. Tente novamente."));
            }
        } catch {
            setError(t("error_connection", "Erro de conexão. Tente novamente."));
        } finally {
            setIsDeclining(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 min-h-[50vh] p-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 overflow-hidden">
                    {companyPhoto ? (
                        <img src={companyPhoto} alt={companyName} className="w-full h-full object-cover" />
                    ) : (
                        <MapPin className="w-10 h-10 text-indigo-500" />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{companyName}</h1>
                <p className="text-gray-500 text-sm mb-6">
                    {t("onsite_confirm_subtitle", "Convite para entrevista presencial")}
                </p>

                <div className="text-gray-600 mb-6 text-sm">
                    <Trans i18nKey="onsite_confirm_body" values={{ job: vagaTitle }}>
                        Você foi selecionado para uma entrevista <strong>presencial</strong> para a vaga de <strong>{vagaTitle}</strong>.
                    </Trans>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                {t("interview_confirm_date_label", "Data")}
                            </p>
                            <p className="font-bold text-gray-900">{date}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                {t("interview_confirm_time_label", "Horário")}
                            </p>
                            <p className="font-bold text-gray-900">{horaInicio}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                {t("onsite_confirm_location_label", "Local")}
                            </p>
                            <p className="font-bold text-gray-900">{companyName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 mb-5 text-left">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800">
                            {t("onsite_confirm_hint", "Após confirmar, aguarde o contato da empresa com o endereço completo e demais instruções para a entrevista.")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirming || isDeclining}
                        className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold text-lg transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isConfirming ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t("interview_confirm_action_confirming", "Confirmando...")}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                {t("onsite_confirm_btn", "Confirmar Presença")}
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDecline}
                        disabled={isConfirming || isDeclining}
                        className="w-full px-6 py-3 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isDeclining
                            ? t("interview_confirm_action_declining", "Recusando...")
                            : t("onsite_decline_btn", "Recusar Convite")}
                    </button>
                </div>
            </div>
        </div>
    );
}
