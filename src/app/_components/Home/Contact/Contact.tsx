"use client";

import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { ContactForm } from "@/src/app/_components/ContactForm/ContactForm";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

export function Contact() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="scroll-mt-24 border-t border-slate-200 bg-brand-surface py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            kicker={t("contact_get_in_touch")}
            title={t("lp_contact_title")}
            description={t("lp_contact_desc")}
          />
          <Reveal delay={120}>
            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue">
                <MessageCircle className="h-6 w-6" />
              </span>
              <p className="text-sm text-slate-600">{t("contact_official_channels")}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150} className="lg:col-span-7">
          {/* Botão do formulário compartilhado no azul da marca, sem alterar o componente */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 [&_button[type=submit]]:bg-brand-navy [&_button[type=submit]]:shadow-none [&_button[type=submit]:hover]:bg-brand-blue">
            <h3 className="mb-6 text-xl font-bold text-brand-ink">
              {t("contact_form_title", "Envie uma mensagem")}
            </h3>
            <ContactForm variant="card" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
