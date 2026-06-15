"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

export function RegisterMentorInfo({ initialName = "", initialSurname = "", userId }: { initialName?: string, initialSurname?: string, userId: string }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [nome, setNome] = useState(initialName);
    const [sobrenome, setSobrenome] = useState(initialSurname);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/mentor/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    sobrenome,
                    usuario_id: userId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Erro desconhecido");
                setIsSubmitting(false);
                return;
            }

            router.push("/mentor/specialties");
        } catch {
            setError(t("register_error_connection"));
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-start w-full px-4 py-8 sm:py-12">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-lg"
            >
                <h2 className="text-2xl font-semibold mb-2 text-center">
                    {t("mentor_register_title")}
                </h2>
                <p className="text-sm text-gray-500 mb-6 text-center italic">
                    {t("mandatory_fields_legend")}
                </p>

                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_name_label")} *</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("candidate_name_placeholder")}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_surname_label")}</label>
                    <input
                        type="text"
                        value={sobrenome}
                        onChange={(e) => setSobrenome(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("candidate_surname_placeholder")}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !nome}
                    className={`w-full text-white py-2 rounded-lg transition-colors cursor-pointer flex justify-center items-center ${isSubmitting || !nome ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t("saving_btn")}
                        </div>
                    ) : (
                        t("continue_btn")
                    )}
                </button>
            </form>
        </div>
    );
}
