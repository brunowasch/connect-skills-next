"use client";

import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

export function Problems() {
  const { t } = useTranslation();
  const items = [1, 2, 3, 4];

  return (
    <section id="problems" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            kicker={t("lp_problem_kicker")}
            title={t("lp_problem_title")}
            description={t("lp_problem_desc")}
          />
        </div>

        <ol className="grid gap-px overflow-hidden rounded-[1.75rem] bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-2 lg:col-span-7">
          {items.map((n, i) => (
            <Reveal
              as="li"
              key={n}
              delay={i * 90}
              className="group bg-white p-8 transition-colors duration-300 hover:bg-brand-surface sm:p-10"
            >
              <span className="text-5xl font-extrabold text-brand-mist transition-colors duration-300 group-hover:text-brand-sky">
                {String(n).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-xl font-bold text-brand-ink">{t(`lp_problem_${n}_title`)}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{t(`lp_problem_${n}_text`)}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
