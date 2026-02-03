"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

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
            <div className="flex justify-center items-center min-h-screen">
                <form
                    onSubmit={handleVerifySubmit}
                    className="bg-white p-8 rounded-xl shadow-md w-full max-w-md animate-in fade-in zoom-in duration-300"
                >
                    <h2 className="text-2xl font-bold mb-4 text-center">{t("register_verify_title")}</h2>
                    <p className="text-gray-600 mb-6 text-center">
                        {t("register_verify_desc", { email })}
                    </p>

                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2 font-semibold">
                            {t("register_code_placeholder")}
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                            required
                            maxLength={6}
                            className="w-full px-4 py-3 border text-center text-2xl tracking-widest uppercase font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="CODE"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer flex justify-center items-center ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t("register_verify_btn")
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep("register")}
                        className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium cursor-pointer"
                    >
                        {t("vacancy_back")}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
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
