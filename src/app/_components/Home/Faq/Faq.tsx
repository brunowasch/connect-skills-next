"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

export function Faq() {
  const { t } = useTranslation();
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading kicker={t("lp_faq_kicker")} title={t("lp_faq_title")} description={t("lp_faq_desc")} />
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200 lg:col-span-8">
          {items.map((n, i) => (
            <Reveal key={n} delay={i * 50}>
              <details className="group py-2" name="faq">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-bold text-brand-ink transition-colors hover:text-brand-blue sm:text-xl [&::-webkit-details-marker]:hidden">
                  {t(`lp_faq_${n}_q`)}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-brand-navy transition duration-300 group-open:rotate-45 group-open:border-brand-navy group-open:bg-brand-navy group-open:text-white">
                    <Plus className="h-5 w-5" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-16 leading-relaxed text-slate-600">{t(`lp_faq_${n}_a`)}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
