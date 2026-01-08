import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-blue-500 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          {/* Quem somos */}
          <div>
            <h5 className="mb-2 text-lg font-semibold">Quem Somos</h5>
            <p className="text-sm text-gray-200 text-justify">
              Connect Skills é uma plataforma de recrutamento focada em conectar
              candidatos com as melhores vagas, usando inteligência artificial
              para destacar as habilidades comportamentais dos candidatos.
            </p>
          </div>

          {/* Contato */}
          <div className="text-center">
            <h5 className="mb-2 text-lg font-semibold">Contato</h5>
            <p className="flex items-center justify-center gap-2 text-sm">
              <FaWhatsapp className="text-green-400" />
              <a
                href="https://wa.me/5551992179330"
                target="_blank"
                className="hover:underline"
              >
                51 99217-9330
              </a>
            </p>
          </div>

          {/* Links */}
          <div className="text-center">
            <h5 className="mb-2 text-lg font-semibold">Links</h5>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/politica-privacidade"
                  className="hover:underline"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:underline">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Apoio */}
        <div className="mb-6 text-center">
          <h5 className="mb-3 text-lg font-semibold">Apoio</h5>
          <div className="mx-auto flex justify-center">
            <Image
              src="/img/sponsors/LOOP_HOST.svg"
              alt="Logo Loop Host"
              width={160}
              height={40}
              className="object-contain"
            />
          </div>
        </div>

        {/* Direitos */}
        <div className="border-t border-white/20 pt-4 text-center text-sm text-gray-300">
          Connect Skills © 2025 - 2026. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
