"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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

export function LoginCard() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");
    const errorParam = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (errorParam === "google_cancelled") {
            setError(t("google_auth_error_cancelled"));
        } else if (errorParam && errorParam.startsWith("google_")) {
            setError(t("google_auth_error_generic"));
        } else if (errorParam === "linkedin_cancelled") {
            setError(t("linkedin_auth_error_cancelled"));
        } else if (errorParam && errorParam.startsWith("linkedin_")) {
            setError(t("linkedin_auth_error_generic"));
        }
    }, [errorParam, t]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError("");
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, senha, keepLogin: rememberMe }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("login_error_generic"));
                setIsLoading(false);
                return;
            }

            if (data.requireVerification) {
                const params = new URLSearchParams({
                    email: data.email,
                    keep: rememberMe ? "true" : "false"
                });

                if (redirectParam) {
                    params.append("redirect", redirectParam);
                }

                router.push(`/login/verify?${params.toString()}`);
                return;
            }

            if (!rememberMe) {
                sessionStorage.setItem("cs_session_active", "true");
            } else {
                sessionStorage.removeItem("cs_session_active");
            }

            const isRegistrationFlow = data.redirectTo.includes("/register") || data.redirectTo.includes("/area");

            if (redirectParam && !isRegistrationFlow) {
                router.push(redirectParam);
            } else {
                router.push(data.redirectTo);
            }
            router.refresh();
            return;
        } catch {
            setError(t("login_error_connection"));
            setIsLoading(false);
        }
    }

    function handleGoogleLogin() {
        setIsGoogleLoading(true);
        window.location.href = `/api/auth/google?tipo=CANDIDATO`;
    }

    function handleLinkedInLogin() {
        setIsLinkedInLoading(true);
        window.location.href = `/api/auth/linkedin?tipo=CANDIDATO`;
    }

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">{t("login_title")}</h2>

                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("login_email")}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("login_email_placeholder")}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("login_password")}</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder={t("login_password_placeholder")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        />
                        <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-gray-900 select-none cursor-pointer">
                            {t("login_keep_logged_in")}
                        </label>
                    </div>

                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                        {t("login_forgot_password")}
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            {t("login_btn_loading", "Entrando...")}
                        </>
                    ) : (
                        t("login_btn")
                    )}
                </button>

                <div className="flex items-center gap-3 mt-5 mb-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">{t("or_divider")}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLinkedInLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    {isGoogleLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <GoogleIcon />
                    )}
                    {t("login_with_google")}
                </button>

                <button
                    type="button"
                    onClick={handleLinkedInLogin}
                    disabled={isLinkedInLoading || isGoogleLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 border border-[#0A66C2] bg-white text-[#0A66C2] py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer mb-5 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    {isLinkedInLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <LinkedInIcon />
                    )}
                    {t("login_with_linkedin")}
                </button>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">{t("dont_have_account")}</span>{" "}
                    <Link href="/register" className="text-blue-600 hover:underline font-medium">
                        {t("register_now")}
                    </Link>
                </div>
            </form>
        </div>
    );
}
