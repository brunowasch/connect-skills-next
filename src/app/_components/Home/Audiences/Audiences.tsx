"use client";

import Link from "next/link";
import { ArrowUpRight, Check, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

export function Audiences() {
  const { t } = useTranslation();

  const tiles = [
    {
      key: "company",
      dark: true,
      bullets: [1, 2, 3, 4, 5].map((n) => t(`lp_aud_company_${n}`)),
    },
    {
      key: "candidate",
      dark: false,
      bullets: [1, 2, 3, 4, 5].map((n) => t(`lp_aud_candidate_${n}`)),
    },
  ];

  const mentorBullets = [1, 2, 3].map((n) => t(`lp_aud_mentor_${n}`));

  return (
    <section id="audiences" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={t("lp_aud_kicker")} title={t("lp_aud_title")} />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {tiles.map((tile, i) => (
            <Reveal key={tile.key} delay={i * 120} className="h-full min-w-0">
              <Link
                href="/register"
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 transition-colors duration-300 sm:p-12 ${tile.dark
                  ? "bg-brand-navy text-white hover:bg-brand-blue"
                  : "border border-slate-200 bg-brand-mist text-brand-ink hover:border-brand-navy/40"
                  }`}
              >
                <div className="relative flex items-start justify-between gap-6">
                  <h3 className="min-w-0 text-[2.25rem] font-extrabold uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
                    <span className={`block text-lg font-bold tracking-[0.25em] ${tile.dark ? "text-brand-sky" : "text-brand-blue"}`}>
                      {t("lp_aud_for")}
                    </span>
                    {t(`lp_aud_${tile.key}_title`)}
                  </h3>
                  <span
                    className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-full transition duration-300 group-hover:rotate-45 sm:flex ${tile.dark ? "bg-white text-brand-navy" : "bg-brand-navy text-white"
                      }`}
                  >
                    <ArrowUpRight className="h-6 w-6" />
                  </span>
                </div>

                <p className={`relative mt-8 max-w-md text-lg leading-relaxed ${tile.dark ? "text-white/75" : "text-slate-600"}`}>
                  {t(`lp_aud_${tile.key}_desc`)}
                </p>

                <ul className="relative mt-8 space-y-3">
                  {tile.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 font-medium">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tile.dark ? "bg-white/10 text-brand-sky" : "bg-white text-brand-blue"
                          }`}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                <span
                  className={`relative mt-10 inline-flex items-center gap-2 pt-2 font-bold ${tile.dark ? "text-brand-sky" : "text-brand-navy"}`}
                >
                  {t(`lp_aud_${tile.key}_cta`)}
                  <span className="h-px w-8 bg-current transition-all duration-300 group-hover:w-14" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Faixa para mentores */}
        <Reveal delay={200} className="mt-6">
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-brand-surface p-8 sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="flex items-start gap-5 lg:col-span-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-brand-blue">
                <GraduationCap className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-2xl font-extrabold text-brand-ink">{t("lp_aud_mentor_title")}</h3>
                <p className="mt-2 text-slate-600">{t("lp_aud_mentor_desc")}</p>
              </div>
            </div>
            <ul className="space-y-2 lg:col-span-4">
              {mentorBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-blue">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="lg:col-span-3 lg:text-right">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-semibold text-white transition hover:bg-brand-blue"
              >
                {t("lp_aud_mentor_cta")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
