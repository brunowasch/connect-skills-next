"use client";

import { useTranslation } from "react-i18next";

interface VerificationModalProps {
    email: string;
    code: string;
    setCode: (code: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onResend: () => void;
    onBack?: () => void;
    isLoading: boolean;
    error: string;
    resendCooldown: number;
    isResending: boolean;
    children?: React.ReactNode;
    title?: string;
    description?: string;
    buttonText?: string;
}

export function VerificationModal({
    email,
    code,
    setCode,
    onSubmit,
    onResend,
    onBack,
    isLoading,
    error,
    resendCooldown,
    isResending,
    children,
    title,
    description,
    buttonText
}: VerificationModalProps) {
    const { t } = useTranslation();

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <form
                onSubmit={onSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md animate-in fade-in zoom-in duration-300"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">
                    {title || t("register_verify_title")}
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                    {description || t("register_verify_desc", { email })}
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

                {children}

                <div className="flex flex-col gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer flex justify-center items-center ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            buttonText || t("register_verify_btn")
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resendCooldown > 0 || isResending}
                        className={`w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer flex justify-center items-center ${(resendCooldown > 0 || isResending) ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isResending ? (
                            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : resendCooldown > 0 ? (
                            `${t("resend_code_btn")} (${Math.floor(resendCooldown / 60)}:${(resendCooldown % 60).toString().padStart(2, '0')})`
                        ) : (
                            t("resend_code_btn")
                        )}
                    </button>

                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium cursor-pointer"
                        >
                            {t("vacancy_back")}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
