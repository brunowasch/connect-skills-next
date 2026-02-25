"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Header, Footer } from "@/src/app/_components/Layout/index";
import { VerificationModal } from "@/src/app/_components/VerificationModal";

function VerifyLoginContent() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const uid = searchParams.get("uid");
    const email = searchParams.get("email");
    const keepParam = searchParams.get("keep");
    const redirectParam = searchParams.get("redirect");
    const keepLogin = keepParam === "true";

    const [code, setCode] = useState("");
    const [rememberDevice, setRememberDevice] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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
        if (resendCooldown > 0 || !email) return;
        setIsResending(true);
        setError("");

        try {
            const res = await fetch("/api/auth/resend-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: 'login' }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || t("error_sending_code"));
            } else {
                setResendCooldown(60); // 1 minute cooldown
            }
        } catch {
            setError(t("login_error_connection"));
        } finally {
            setIsResending(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        console.log(`[VERIFY-PAGE] Submitting. KeepLogin Param: ${keepParam} (Parsed: ${keepLogin}), State RememberDevice: ${rememberDevice}`);

        try {
            const res = await fetch("/api/auth/verify-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: uid,
                    code,
                    rememberDevice,
                    keepLogin
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("register_wrong_code"));
                setLoading(false);
                return;
            }

            // Mark session as active in storage (for Strict Session enforcement)
            if (!keepLogin) {
                sessionStorage.setItem("cs_session_active", "true");
            } else {
                sessionStorage.removeItem("cs_session_active");
            }

            const isRegistrationFlow = data.redirectTo.includes("/register") || data.redirectTo.includes("/area");

            if (redirectParam && !isRegistrationFlow) {
                router.push(redirectParam);
            } else {
                router.push(data.redirectTo || "/candidate/dashboard");
            }
        } catch {
            setError(t("login_error_connection"));
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
                <VerificationModal
                    email={email || ""}
                    code={code}
                    setCode={setCode}
                    onSubmit={handleSubmit}
                    onResend={handleResendCode}
                    onBack={() => router.push("/login")}
                    isLoading={loading}
                    error={error}
                    resendCooldown={resendCooldown}
                    isResending={isResending}
                    title={t("login_verify_title")} // Use existing login translation
                    description={t("login_verify_desc", { email: email })}
                    buttonText={t("verify_btn")}
                >
                    <div className="flex items-center mb-6">
                        <input
                            id="remember-device"
                            type="checkbox"
                            checked={rememberDevice}
                            onChange={(e) => setRememberDevice(e.target.checked)}
                            className="appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer relative shrink-0 transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        />
                        <label htmlFor="remember-device" className="ml-2 text-sm font-medium text-gray-900 select-none cursor-pointer">
                            {t("login_remember_device")}
                        </label>
                    </div>
                </VerificationModal>
            </div>
            <Footer />
        </div>
    );
}

export default function VerifyLoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10">Carregando...</div>}>
            <VerifyLoginContent />
        </Suspense>
    );
}
