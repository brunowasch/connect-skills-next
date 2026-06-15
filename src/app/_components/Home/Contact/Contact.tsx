"use client";

import { useTranslation } from "react-i18next";
import { FaEnvelope } from "react-icons/fa";
import { ContactForm } from "@/src/app/_components/ContactForm/ContactForm";

export function Contact() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-semibold text-gray-900">
            {t("contact_get_in_touch")}
          </h2>
          <p className="text-gray-500">
            {t("contact_official_channels")}
          </p>
        </div>
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 text-center">
            {t("contact_form_title", "Envie uma mensagem")}
          </h3>
          <ContactForm variant="card" />
        </div>
      </div>
    </section>
  );
}
