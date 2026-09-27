"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Cookie } from "lucide-react";
import { useTranslation } from "react-i18next";

export const COOKIE_CONSENT_KEY = "cookie_consent";

export type CookieConsentValue = "all" | "essential";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => Cookies.get(COOKIE_CONSENT_KEY) ?? null;
// No servidor o consentimento é desconhecido: não renderiza o banner para evitar hydration mismatch
const getServerSnapshot = () => "pending";

export function CookieConsent() {
    const { t } = useTranslation();
    const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const saveConsent = (value: CookieConsentValue) => {
        Cookies.set(COOKIE_CONSENT_KEY, value, { expires: 365, sameSite: "lax", path: "/" });
        listeners.forEach((listener) => listener());
    };

    if (consent) return null;

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label={t("cookie_consent_title")}
            className="animate-in fade-in slide-in-from-bottom fixed inset-x-4 bottom-4 z-[9998] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:inset-x-6"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Cookie className="h-5 w-5" />
                    </div>
                    <div className="text-sm text-gray-600">
                        <p className="font-semibold text-gray-900">{t("cookie_consent_title")}</p>
                        <p className="mt-1">
                            {t("cookie_consent_message")}{" "}
                            <Link href="/cookies" className="font-medium text-blue-600 underline hover:text-blue-700">
                                {t("cookie_consent_learn_more")}
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => saveConsent("essential")}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        {t("cookie_consent_essential")}
                    </button>
                    <button
                        type="button"
                        onClick={() => saveConsent("all")}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                        {t("cookie_consent_accept")}
                    </button>
                </div>
            </div>
        </div>
    );
}
