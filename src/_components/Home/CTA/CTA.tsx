import Link from "next/link";
import { HiUserAdd, HiLogin } from "react-icons/hi";

export function CTA() {
  return (
    <>
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 rounded-2xl bg-blue-500 p-6 shadow-md lg:flex-row lg:items-center lg:justify-between">
            <div className="p-5">
              <h3 className="text-3xl font-semibold text-white">Pronto para começar?</h3>
              <p className="text-white">
                Cadastre-se ou faça login e dê o próximo passo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/pages/auth/register"
                className="flex items-center rounded-lg bg-white px-6 py-3 text-lg text-blue-500 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <HiUserAdd className="text-xl mr-2" />
                Cadastrar
              </Link>

              <Link
                href="/pages/auth/login"
                className="flex items-center rounded-lg border bg-white px-6 py-3 text-lg text-blue-500 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <HiLogin className="text-xl mr-2" />
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
