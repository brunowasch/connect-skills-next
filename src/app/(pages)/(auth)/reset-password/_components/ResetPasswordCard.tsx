"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/src/app/actions/auth/reset-password";
import Link from "next/link";
import { Suspense } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { validatePassword, PASSWORD_REQUIREMENTS } from "@/src/lib/password-validation";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");


    const { isValid: isPasswordValid } = validatePassword(password);
    const doPasswordsMatch = password === confirmPassword && password.length > 0;
    const canSubmit = isPasswordValid && doPasswordsMatch;

    useEffect(() => {
        if (!token || !email) {
            setStatus("error");
            setMessage("Token ou email inválido ou ausente.");
        }
    }, [token, email]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!token || !email) return;
        if (!canSubmit) return;

        setStatus("loading");
        setMessage("");

        const res = await resetPassword(email, token, password);

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

    if (!token || !email) {
         return (
             <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
                 <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Link Inválido</h2>
                    <p className="mb-6">O link de redefinição de senha é inválido ou expirou.</p>
                    <Link href="/forgot-password" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Solicitar novo link
                    </Link>
                 </div>
             </div>
         )
    }

    return (
         <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Redefinir Senha</h2>
                
                {message && (
                    <div className={`mb-4 p-3 rounded text-sm text-center ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                {status === 'success' ? (
                     <div className="text-center">
                        <p className="mb-4 text-gray-600">Sua senha foi atualizada. Você será redirecionado para o login em instantes.</p>
                        <Link href="/login" className="text-blue-600 hover:underline">Ir para Login agora</Link>
                     </div>
                ) : (
                    <>
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
                            
                            {}
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                                <p className="font-semibold mb-2">Requisitos da senha:</p>
                                <ul className="space-y-1">
                                    <li className={`flex items-center gap-2 ${password.length >= PASSWORD_REQUIREMENTS.minLength ? "text-green-600" : "text-gray-500"}`}>
                                        {password.length >= PASSWORD_REQUIREMENTS.minLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                        Mínimo de 8 caracteres
                                    </li>
                                    <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasUpperCase.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                        {PASSWORD_REQUIREMENTS.hasUpperCase.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                        Pelo menos uma letra maiúscula
                                    </li>
                                    <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasLowerCase.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                        {PASSWORD_REQUIREMENTS.hasLowerCase.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                        Pelo menos uma letra minúscula
                                    </li>
                                    <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasNumber.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                        {PASSWORD_REQUIREMENTS.hasNumber.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                        Pelo menos um número
                                    </li>
                                    <li className={`flex items-center gap-2 ${PASSWORD_REQUIREMENTS.hasSpecialChar.test(password) ? "text-green-600" : "text-gray-500"}`}>
                                        {PASSWORD_REQUIREMENTS.hasSpecialChar.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                                        Pelo menos um caractere especial
                                    </li>
                                </ul>
                            </div>
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
                            {password && confirmPassword && !doPasswordsMatch && (
                                <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading" || !canSubmit}
                            className={`w-full py-2 rounded-lg text-white transition-colors ${
                                status === "loading" || !canSubmit  
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                        >
                            {status === "loading" ? "Redefinindo..." : "Redefinir Senha"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}

export function ResetPasswordCard() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8">Carregando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
