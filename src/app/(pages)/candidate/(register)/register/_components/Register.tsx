"use client";

import Cookies from "js-cookie";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";

export function RegisterCandidateName() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [data_nascimento, setDataNascimento] = useState("");
    const [age, setAge] = useState<number | null>(null);
    const [consentimentoParental, setConsentimentoParental] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isSubmitting) {
                e.preventDefault();
                e.returnValue = t("confirm_leave_page");
                return t("confirm_leave_page");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [t, isSubmitting]);

    useEffect(() => {
        if (data_nascimento) {
            const birthDate = new Date(data_nascimento);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge);
        } else {
            setAge(null);
        }
    }, [data_nascimento]);

    const birthYear = data_nascimento ? new Date(data_nascimento).getFullYear() : null;
    const isFutureDate = birthYear !== null && birthYear > 2026;
    const isTooOld = birthYear !== null && birthYear <= 1900;
    const isUnder16 = age !== null && age < 16 && !isFutureDate && !isTooOld;
    const isMinor = age !== null && age >= 16 && age < 18 && !isFutureDate && !isTooOld;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (isFutureDate) {
            setError(t("candidate_age_error_invalid_date"));
            setIsSubmitting(false);
            return;
        }

        if (isTooOld) {
            setError(t("candidate_age_error_too_old"));
            setIsSubmitting(false);
            return;
        }

        if (isUnder16) {
            setError(t("candidate_age_error_under_16"));
            setIsSubmitting(false);
            return;
        }

        if (isMinor) {
            if (!consentimentoParental) {
                setError(t("parental_consent_required_error"));
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const userId = Cookies.get("time_user_id");
            const res = await fetch("/api/candidate/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: nome,
                    sobrenome: sobrenome || undefined,
                    data_nascimento: data_nascimento,
                    usuario_id: userId,
                    consentimento_parental: isMinor ? consentimentoParental : undefined,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("error_unknown"));
                setIsSubmitting(false);
                return;
            }
            if (res.ok) {
                router.push("/candidate/area");
            }
        } catch {
            setError(t("error_connection"));
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center w-full px-4 py-20 md:py-40">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-lg"
            >
                <h2 className="text-2xl font-semibold mb-2 text-center">
                    {t("candidate_register_title")}
                </h2>
                <p className="text-sm text-gray-500 mb-6 text-center italic">
                    {t("mandatory_fields_legend")}
                </p>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_name_label")} *</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("candidate_name_placeholder")}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_surname_label")}</label>
                    <input
                        type="text"
                        value={sobrenome}
                        onChange={(e) => setSobrenome(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("candidate_surname_placeholder")}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_birthdate_label")} *</label>
                    <input
                        type="date"
                        value={data_nascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required
                        min="1900-01-01"
                        max="2026-12-31"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        lang={i18n.language?.startsWith('pt') ? 'pt-BR' : i18n.language?.startsWith('es') ? 'es-ES' : 'en-US'}
                    />
                </div>

                {isFutureDate && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {t("candidate_age_error_invalid_date")}
                    </div>
                )}

                {isTooOld && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {t("candidate_age_error_too_old")}
                    </div>
                )}

                {isUnder16 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {t("candidate_age_error_under_16")}
                    </div>
                )}

                {isMinor && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-md font-medium text-blue-800 mb-2">{t("parental_consent_title")}</h3>
                        <p className="text-sm text-blue-600 mb-4">{t("parental_consent_desc")}</p>
                        
                        <div className="flex items-start gap-3">
                            <input 
                                id="parental-consent"
                                type="checkbox" 
                                checked={consentimentoParental}
                                onChange={(e) => setConsentimentoParental(e.target.checked)}
                                required
                                className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all mt-0.5 after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                            />
                            <label htmlFor="parental-consent" className="text-sm text-gray-700 select-none cursor-pointer">
                                <Trans
                                    i18nKey="parental_consent_label"
                                    components={[
                                        <Link href="#" className="text-blue-600 hover:underline font-medium" key="terms" />,
                                        <Link href="#" className="text-blue-600 hover:underline font-medium" key="privacy" />
                                    ]}
                                />
                            </label>
                        </div>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isFutureDate || isTooOld || isUnder16 || isSubmitting || (isMinor && !consentimentoParental)}
                    className={`w-full text-white py-2 rounded-lg transition-colors cursor-pointer ${
                        isFutureDate || isTooOld || isUnder16 || isSubmitting || (isMinor && !consentimentoParental) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {t("continue_btn")}
                </button>
            </form >
        </div >
    );
}
