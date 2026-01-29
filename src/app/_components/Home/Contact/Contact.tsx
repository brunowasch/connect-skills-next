"use client";

import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export function Contact() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-semibold">
            {t("contact_get_in_touch")}
          </h2>
          <p className="text-gray-500">
            {t("contact_official_channels")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Whatsapp */}
          <div className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md">
            <FaWhatsapp className="mb-3 text-4xl text-green-500" />

            <h6 className="mb-1 font-semibold">{t("whatsapp")}</h6>
            <p className="mb-4 text-sm text-gray-500">
              {t("contact_whatsapp_desc")}
            </p>

            <a
              href="https://wa.me/5551992179330"
              target="_blank"
              className="mb-4 font-medium text-blue-600 hover:underline"
            >
              +55 51 99217-9330
            </a>

            <a
              href="https://wa.me/5551992179330"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
            >
              <FaWhatsapp />
              {t("contact_whatsapp_btn")}
            </a>
          </div>

          {/* E-mail */}
          <div className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md">
            <FaEnvelope className="mb-3 text-4xl text-blue-600" />

            <h6 className="mb-1 font-semibold">E-mail</h6>
            <p className="mb-4 text-sm text-gray-500">
              {t("contact_email_desc")}
            </p>

            <a
              href="mailto:connect0skills@gmail.com"
              className="mb-4 font-medium text-blue-600 hover:underline"
            >
              connect0skills@gmail.com
            </a>

            <a
              href="mailto:connect0skills@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <FaEnvelope />
              {t("contact_email_btn")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
