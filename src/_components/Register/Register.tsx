"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"CANDIDATO" | "EMPRESA">("CANDIDATO");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha, tipo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro desconhecido");
        return;
      }

      router.push(data.redirectTo);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="mb-6">
          <span className="block text-gray-700 mb-2">Tipo de Usuário</span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTipo("CANDIDATO")}
              className={`flex-1 py-2 rounded-lg border transition-colors cursor-pointer ${
                tipo === "CANDIDATO"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Candidato
            </button>
            <button
              type="button"
              onClick={() => setTipo("EMPRESA")}
              className={`flex-1 py-2 rounded-lg border transition-colors cursor-pointer ${
                tipo === "EMPRESA"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Empresa
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite seu e-mail"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite sua senha"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}
