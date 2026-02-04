"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

export function LoginCard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            console.log("Submitting login. RememberMe:", rememberMe);
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
                return;
            }

            if (data.requireVerification) {
                const params = new URLSearchParams({
                    uid: data.userId,
                    email: data.email,
                    keep: rememberMe ? "true" : "false"
                });
                router.push(`/login/verify?${params.toString()}`);
                return;
            }

            if (!rememberMe) {
                sessionStorage.setItem("cs_session_active", "true");
            } else {
                sessionStorage.removeItem("cs_session_active");
            }

            router.push(data.redirectTo);
        } catch {
            setError(t("login_error_connection"));
        }
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
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    {t("login_btn")}
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
