import Link from "next/link";
import { HiUserAdd, HiLogin } from "react-icons/hi";

export function Hero() {
  return (
    <section className="py-10" id="home">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="mb-2 font-semibold text-gray-600">
              Bem-vindo(a) ao Connect Skills
            </h3>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Conecte-se ao mercado de trabalho{" "}
              <span className="block text-xl font-medium text-blue-500 sm:inline">
                com inteligência e praticidade
              </span>
            </h1>
            <p className="mb-6 text-lg text-gray-500">
              Cadastre-se em poucos passos ou faça login para explorar as
              oportunidades e publicar vagas.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-lg font-medium text-white transition hover:bg-blue-600"
              >
                <HiUserAdd className="text-xl" />
                Cadastrar
              </Link>

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border border-blue-500 px-6 py-3 text-lg font-medium text-blue-500 transition hover:bg-blue-500 hover:text-white"
              >
                <HiLogin className="text-xl" />
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 border-opacity-25" />
    </section>
  );
}