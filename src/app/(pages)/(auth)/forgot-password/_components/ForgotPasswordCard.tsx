"use client";

import { useState, useEffect } from "react";
import { requestPasswordReset, verifyResetCode, resetPassword } from "@/src/app/actions/auth/reset-password";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VerificationModal } from "@/src/app/_components/VerificationModal";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Check } from "lucide-react";
import { validatePassword, PASSWORD_REQUIREMENTS } from "@/src/lib/password-validation";

export function ForgotPasswordCard() {
    const { t } = useTranslation();
    const router = useRouter();

    const [step, setStep] = useState<"email" | "verify" | "reset">("email");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const [email, setEmail] = useState("");
    
    // Step 2: Code
    const [code, setCode] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    // Step 3: Password
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // HANDLERS

    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        const res = await requestPasswordReset(email);

        if (res.success) {
            setStatus("idle");
            setStep("verify");
            setResendCooldown(60);
        } else {
            setStatus("error");
            setMessage(res.error || "Ocorreu um erro.");
        }
    }

    async function handleCodeSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        const res = await verifyResetCode(email, code);

        if (res.success) {
            setStatus("idle");
            setStep("reset");
        } else {
            setStatus("error");
            setMessage(res.error || "Código inválido.");
            // Keep in verify step
        }
    }

    async function handleResendCode() {
        if (resendCooldown > 0) return;
        setIsResending(true);
        setMessage(""); // clear main error if any specific to code

        const res = await requestPasswordReset(email);

        if (res.success) {
            setResendCooldown(60);
            setStatus("success");
            setMessage("Novo código enviado!");
            setTimeout(() => {
                 if (step === "verify") {
                     setStatus("idle"); 
                     setMessage("");
                 }
            }, 3000);
        } else {
            setStatus("error");
            setMessage(res.error || "Erro ao reenviar código.");
        }
        setIsResending(false);
    }

    async function handleResetPasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        const { isValid } = validatePassword(password);
        if (!isValid) return;
        if (password !== confirmPassword) return;

        setStatus("loading");
        setMessage("");

        const res = await resetPassword(email, code, password);

        if (res.success) {
            setStatus("success");
            setMessage(res.message || "Senha alterada com sucesso!");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } else {
            setStatus("error");
            setMessage(res.error || "Erro ao alterar senha.");
        }
    }

    // RENDER

    if (step === "verify") {
        return (
            <VerificationModal
                email={email}
                code={code}
                setCode={setCode}
                onSubmit={handleCodeSubmit}
                onResend={handleResendCode}
                onBack={() => setStep("email")}
                isLoading={status === "loading"}
                error={status === "error" ? message : ""}
                resendCooldown={resendCooldown}
                isResending={isResending}
                title="Verificar Email"
                description={`Enviamos um código para ${email}. Digite-o abaixo para redefinir sua senha.`}
                buttonText="Verificar e Continuar"
            />
        );
    }

    if (step === "reset") {
        const { isValid: isPasswordValid } = validatePassword(password);
        const passwordsMatch = password === confirmPassword;
        const canSubmit = isPasswordValid && passwordsMatch && password.length > 0;

        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
                <form
                    onSubmit={handleResetPasswordSubmit}
                    className="bg-white p-8 rounded-xl shadow-md w-full max-w-md animate-in fade-in zoom-in duration-300"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">Redefinir Senha</h2>
                    
                    {message && (
                        <div className={`mb-4 p-3 rounded text-sm text-center ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Nova Senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                         {/* Password Requirements Checklist - Show only when typing */}
                        {password.length > 0 && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                            <p className="font-semibold mb-2">{t("password_requirements_title")}</p>
                            <ul className="space-y-1">
                                <li className={`flex items-center gap-2 ${password.length >= PASSWORD_REQUIREMENTS.minLength ? "text-green-600" : "text-gray-500"}`}>
                                    {password.length >= PASSWORD_REQUIREMENTS.minLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_min_length")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasUpperCase.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasUpperCase.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_uppercase")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasLowerCase.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasLowerCase.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_lowercase")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasNumber.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasNumber.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_number")}
                                </li>
                                <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasSpecialChar.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                    {PASSWORD_REQUIREMENTS.hasSpecialChar.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                    {t("password_special")}
                                </li>
                            </ul>
                        </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Confirmar Nova Senha</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder="••••••••"
                            />
                             <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {password && confirmPassword && password !== confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || !canSubmit}
                        className={`w-full py-2 rounded-lg text-white transition-colors cursor-pointer ${
                            status === "loading" || !canSubmit
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {status === "loading" ? "Redefinindo..." : "Redefinir Senha"}
                    </button>
                </form>
            </div>
        )
    }

    return (
         <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <form
                onSubmit={handleEmailSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md animate-in fade-in zoom-in duration-300"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Recuperação de Senha</h2>
                
                <p className="text-gray-600 mb-6 text-center text-sm">
                    Informe seu e-mail para receber um código de recuperação.
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded text-sm text-center ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="seu@email.com"
                        disabled={status === "loading"}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 cursor-pointer"
                >
                    {status === "loading" ? "Enviando..." : "Enviar Código"}
                </button>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-blue-600 hover:underline text-sm">
                        Voltar para o Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
