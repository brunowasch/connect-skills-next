"use client";

import Cookies from "js-cookie";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterCompany() {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [decricao, setDescricao] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const userId = Cookies.get("time_user_id");
            const res = await fetch("/api/company/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: nome,
                    descricao: decricao,
                    usuario_id: userId,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro desconhecido");
                return;
            }
            if (res.ok) {
                router.push("/pages/company/dashboard");
            }
            router.push("/pages/company/dashboard");
        } catch {
            setError("Erro de conexão. Tente novamente.");
        }
    }

    return (
        <div className="flex justify-center items-center m-30">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Preencha os dados a seguir:
                </h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Razão Social</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite a razão social"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Descrição</label>
                    <textarea
                        value={decricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dê uma descrição à empresa, citando seus serviços e produtos."
                    >
                    </textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    Continuar
                </button>
            </form>
        </div>
    );
}
