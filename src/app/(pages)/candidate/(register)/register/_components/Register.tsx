"use client";

import Cookies from "js-cookie";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export function RegisterCandidateName() {
    const { t } = useTranslation();
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [data_nascimento, setDataNascimento] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isSubmitting) {
                e.preventDefault();
                e.returnValue = t("confirm_leave_page");
                return t("confirm_leave_page");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [t, isSubmitting]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const userId = Cookies.get("time_user_id");
            const res = await fetch("/api/candidate/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: nome,
                    sobrenome: sobrenome,
                    data_nascimento: data_nascimento,
                    usuario_id: userId,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("error_unknown"));
                return;
            }
            if (res.ok) {
                router.push("/candidate/area");
            }
        } catch {
            setError(t("error_connection"));
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center w-full px-4 py-20 md:py-40">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-lg"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    {t("candidate_register_title")}
                </h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_name_label")}</label>
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
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t("candidate_surname_placeholder")}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">{t("candidate_birthdate_label")}</label>
                    <input
                        type="date"
                        value={data_nascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    {t("continue_btn")}
                </button>
            </form >
        </div >
    );
}
