"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useState } from "react";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "pt", name: "Português", flag: "🇧🇷" },
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "es", name: "Español", flag: "🇪🇸" },
    ];

    const currentLanguage = languages.find((l) => l.code === i18n.language.split('-')[0]) || languages[0];

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all text-gray-700 border border-gray-200 shadow-sm cursor-pointer"
            >
                <Globe size={16} className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">{currentLanguage.code}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        i18n.changeLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-slate-50 cursor-pointer ${i18n.language.startsWith(lang.code) ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
