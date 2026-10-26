"use client";

import {
  BrainCircuit,
  Search,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

const steps: { icon: LucideIcon }[] = [
  { icon: UserRound },
  { icon: BrainCircuit },
  { icon: Search },
  { icon: Video },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section
      id="how"
      className="scroll-mt-24 border-y border-slate-200 bg-brand-surface py-20 lg:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          align="center"
          kicker={t("lp_how_kicker")}
          title={t("lp_how_title")}
          description={t("lp_how_desc")}
        />

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon }, index) => {
            const step = index + 1;

            return (
              <Reveal
                as="li"
                key={step}
                delay={index * 110}
                className="h-full"
              >
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-colors duration-300 hover:border-brand-navy/40">
                  {/* Barra decorativa da janela */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-sky/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-navy/70" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-blue transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-white">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>

                      <span className="text-sm font-bold text-slate-300">
                        {String(step).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-brand-ink">
                      {t(`lp_how_c_${step}_title`)}
                    </h3>

                    <p className="mt-3 leading-relaxed text-slate-600">
                      {t(`lp_how_c_${step}_text`)}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}