"use client";

import Cookies from "js-cookie";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterCandidateName() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [data_nascimento, setDataNascimento] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
        setError(data.error || "Erro desconhecido");
        return;
      }
      if (res.ok) {
        router.push("/candidate/register/select-areas");
      }
      router.push("/pages/candidate/register/select-areas");
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
          <label className="block text-gray-700 mb-2">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite seu nome"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Sobrenome</label>
          <input
            type="text"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite seu sobrenome"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Data de nascimento</label>
          <input
            type="date"
            value={data_nascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
