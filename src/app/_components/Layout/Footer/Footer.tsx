"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ContactForm } from "@/src/app/_components/ContactForm/ContactForm";

export function Footer() {
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="bg-blue-500 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-8 sm:grid-cols-3">
          <div className="sm:col-start-1">
            <h5 className="mb-2 text-lg font-semibold">{t("footer_who_we_are")}</h5>
            <p className="text-sm text-gray-200 text-justify">
              {t("footer_desc")}
            </p>
          </div>


          {/* Links */}
          <div className="text-left sm:col-start-3">
            <h5 className="mb-2 text-lg font-semibold">{t("footer_links")}</h5>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/terms" className="hover:underline">
                  {t("footer_terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:underline"
                >
                  {t("footer_privacy")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:underline">
                  {t("footer_cookies")}
                </Link>
              </li>
              <li>
                <button onClick={() => setContactOpen(true)} className="hover:underline text-left">
                  {t("footer_contact", "Contato")}
                </button>
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

      {
        contactOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 text-left text-gray-900"
            onClick={() => setContactOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fadeIn relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setContactOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                {t("footer_contact", "Contato")}
              </h2>
              <ContactForm variant="compact" />
            </div>
          </div>
        )
      }
    </footer >
  );
}
