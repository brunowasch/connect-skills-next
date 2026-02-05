"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";
import { VerificationModal } from "@/src/app/_components/VerificationModal";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { validatePassword, PASSWORD_REQUIREMENTS } from "@/src/lib/password-validation";

export function RegisterCard() {
    const { t } = useTranslation();
    const router = useRouter();

    const [step, setStep] = useState<"register" | "verify">("register");
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tipo, setTipo] = useState<"CANDIDATO" | "EMPRESA">("CANDIDATO");
    const [code, setCode] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    async function handleResendCode() {
        if (resendCooldown > 0) return;
        setIsResending(true);
        setError("");

        try {
            const res = await fetch("/api/auth/resend-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || t("error_sending_code"));
            } else {
                setResendCooldown(60);
            }
        } catch {
            setError(t("register_error_connection"));
        } finally {
            setIsResending(false);
        }
    }

    async function handleRegisterSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const { isValid, errors: passwordErrors } = validatePassword(senha);
        if (!isValid) {
            setError(t("register_error_password_requirements") || "A senha não atende aos requisitos.");
            return;
        }

        if (senha !== confirmSenha) {
            setError(t("register_error_password_mismatch") || "As senhas não coincidem.");
            return;
        }

        if (!acceptedTerms) {
            setError(t("register_error_terms_required"));
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha, tipo, acceptedTerms }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(t(data.error || "register_error_generic"));
                setIsLoading(false);
                return;
            }

            if (data.requiresVerification) {
                setStep("verify");
            } else {
                router.push(data.redirectTo);
            }
        } catch {
            setError(t("register_error_connection"));
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerifySubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("register_wrong_code"));
                setIsLoading(false);
                return;
            }

            // Success: Redirect to next step
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            }
        } catch {
            setError(t("register_error_connection"));
        } finally {
            setIsLoading(false);
        }
    }

    if (step === "verify") {
        return (
            <VerificationModal
                email={email}
                code={code}
                setCode={setCode}
                onSubmit={handleVerifySubmit}
                onResend={handleResendCode}
                onBack={() => setStep("register")}
                isLoading={isLoading}
                error={error}
                resendCooldown={resendCooldown}
                isResending={isResending}
            />
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[calc(120vh-12rem)]">
            <form
                onSubmit={handleRegisterSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">{t("register_title")}</h2>

                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <div className="mb-6">
                    <span className="block text-gray-700 mb-2">{t("register_user_type")}</span>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setTipo("CANDIDATO")}
                            className={`flex-1 py-2 rounded-lg border transition-colors cursor-pointer ${tipo === "CANDIDATO"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {t("register_candidate")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo("EMPRESA")}
                            className={`flex-1 py-2 rounded-lg border transition-colors cursor-pointer ${tipo === "EMPRESA"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {t("register_company")}
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("register_email")}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("register_email_placeholder")}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">{t("register_password")}</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder={t("register_password_placeholder")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {senha.length > 0 && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                            <p className="font-semibold mb-2">{t("password_requirements_title")}</p>
                            <ul className="space-y-1">
                                <li className={`flex items-center gap-2 ${senha.length >= PASSWORD_REQUIREMENTS.minLength ? "text-green-600" : "text-gray-500"}`}>
                                    {senha.length >= PASSWORD_REQUIREMENTS.minLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_min_length")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasUpperCase.test(senha) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasUpperCase.test(senha) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_uppercase")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasLowerCase.test(senha) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasLowerCase.test(senha) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_lowercase")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasNumber.test(senha) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasNumber.test(senha) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_number")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasSpecialChar.test(senha) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasSpecialChar.test(senha) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_special")}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">{t("password_confirm")}</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmSenha}
                            onChange={(e) => setConfirmSenha(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder={t("password_confirm_placeholder")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {senha && confirmSenha && senha !== confirmSenha && (
                        <p className="text-red-500 text-xs mt-1">{t("password_mismatch")}</p>
                    )}
                    {senha && confirmSenha && senha !== confirmSenha && (
                        <p className="text-red-500 text-xs mt-1">{t("password_mismatch")}</p>
                    )}
                </div>

                <div className="mb-6 flex items-start gap-3">
                    <input
                        id="terms-consent"
                        type="checkbox"
                        required
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all mt-0.5 after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                    />
                    <label htmlFor="terms-consent" className="text-sm text-gray-700 select-none cursor-pointer">
                        <Trans
                            i18nKey="register_terms_label"
                            components={[
                                <Link href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium" key="terms" />,
                                <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium" key="privacy" />
                            ]}
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !acceptedTerms}
                    className={`w-full text-white py-2 rounded-lg transition-colors cursor-pointer flex justify-center items-center ${
                        isLoading || !acceptedTerms ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t("register_btn")
                    )}
                </button>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">{t("already_have_account")}</span>{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        {t("login_now")}
                    </Link>
                </div>
            </form>
        </div>
    );
}
