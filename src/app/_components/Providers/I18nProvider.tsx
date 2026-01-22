"use client";

import { ReactNode, useEffect } from "react";
import "@/src/lib/i18n";
import { useTranslation } from "react-i18next";

export function I18nProvider({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();

    // Garante que o atributo lang da tag html esteja sincronizado
    useEffect(() => {
        const handleLanguageChange = (lng: string) => {
            document.documentElement.lang = lng;
        };

        i18n.on("languageChanged", handleLanguageChange);
        document.documentElement.lang = i18n.language;

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, [i18n]);

    return <>{children}</>;
}
