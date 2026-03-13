"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";
import { VerificationModal } from "@/src/app/_components/VerificationModal";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { validatePassword, PASSWORD_REQUIREMENTS } from "@/src/lib/password-validation";

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);

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

    function handleGoogleRegister() {
        if (!acceptedTerms) {
            setError(t("register_error_terms_required"));
            return;
        }
        setIsGoogleLoading(true);
        window.location.href = `/api/auth/google?tipo=${tipo}`;
    }

    function handleLinkedInRegister() {
        if (!acceptedTerms) {
            setError(t("register_error_terms_required"));
            return;
        }
        setIsLinkedInLoading(true);
        window.location.href = `/api/auth/linkedin?tipo=${tipo}`;
    }

    function handleFacebookRegister() {
        if (!acceptedTerms) {
            setError(t("register_error_terms_required"));
            return;
        }
        setIsFacebookLoading(true);
        window.location.href = `/api/auth/facebook?tipo=${tipo}`;
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
                    className={`w-full text-white py-2 rounded-lg transition-colors cursor-pointer flex justify-center items-center ${isLoading || !acceptedTerms ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t("register_btn")
                    )}
                </button>

                <div className="flex items-center gap-3 mt-5 mb-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">{t("or_divider")}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={isGoogleLoading || isLinkedInLoading || isFacebookLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    {isGoogleLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <GoogleIcon />
                    )}
                    {t("register_with_google")}
                </button>

                <button
                    type="button"
                    onClick={handleLinkedInRegister}
                    disabled={isLinkedInLoading || isGoogleLoading || isFacebookLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 border border-[#0A66C2] bg-white text-[#0A66C2] py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer mb-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    {isLinkedInLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <LinkedInIcon />
                    )}
                    {t("register_with_linkedin")}
                </button>

                <button
                    type="button"
                    onClick={handleFacebookRegister}
                    disabled={isFacebookLoading || isGoogleLoading || isLinkedInLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 border border-[#1877F2] bg-white text-[#1877F2] py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer mb-5 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    {isFacebookLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <FacebookIcon />
                    )}
                    {t("register_with_facebook", "Cadastrar com Facebook")}
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
