"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-blue-500 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          {/* Quem somos */}
          <div>
            <h5 className="mb-2 text-lg font-semibold">{t("footer_who_we_are")}</h5>
            <p className="text-sm text-gray-200 text-justify">
              {t("footer_desc")}
            </p>
          </div>

          {/* Contato */}
          <div className="text-center">
            <h5 className="mb-2 text-lg font-semibold">{t("contato")}</h5>
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
            <h5 className="mb-2 text-lg font-semibold">{t("footer_links")}</h5>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/politica-privacidade"
                  className="hover:underline"
                >
                  {t("footer_privacy")}
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:underline">
                  {t("footer_terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Apoio */}
        <div className="mb-6 text-center">
          <h5 className="mb-3 text-lg font-semibold">{t("footer_support")}</h5>
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
          Connect Skills © 2025 - 2026. {t("footer_rights_reserved")}
        </div>
      </div>
    </footer>
  );
}
