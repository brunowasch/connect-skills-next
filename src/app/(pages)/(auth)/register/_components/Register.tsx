"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { VerificationModal } from "@/src/app/_components/VerificationModal";

export function RegisterCard() {
    const { t } = useTranslation();
    const router = useRouter();

    const [step, setStep] = useState<"register" | "verify">("register");
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [tipo, setTipo] = useState<"CANDIDATO" | "EMPRESA">("CANDIDATO");
    const [code, setCode] = useState("");

    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    // Timer for cooldown
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
                setResendCooldown(60); // 1 minute cooldown
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
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha, tipo }),
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
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
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
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("register_password_placeholder")}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex justify-center items-center ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t("register_btn")
                    )}
                </button>
            </form>
        </div>
    );
}
