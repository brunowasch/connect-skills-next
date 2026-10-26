"use client";

import { BellRing, Clock, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../Reveal/Reveal";

export function Commitment() {
  const { t } = useTranslation();
  const steps = [Clock, BellRing, Lock];

  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative grid overflow-hidden rounded-3xl bg-brand-navy text-white lg:grid-cols-12">
            {/* Destaque numérico */}
            <div className="relative flex flex-col justify-center border-b border-white/10 p-8 sm:p-12 lg:col-span-5 lg:border-r lg:border-b-0">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-sky">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-sky" />
                {t("lp_commit_kicker")}
              </span>
              <p className="mt-8 text-[6rem] font-extrabold leading-none tracking-tighter sm:text-[8rem]">
                7<span className="ml-3 text-4xl font-bold tracking-tight text-brand-sky sm:text-5xl">{t("lp_commit_days")}</span>
              </p>
              <p className="mt-4 max-w-sm text-lg text-white/75">{t("lp_commit_stat_desc")}</p>
            </div>

            <div className="relative p-8 sm:p-12 lg:col-span-7">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{t("lp_commit_title")}</h2>
              <p className="mt-4 text-white/70">{t("lp_commit_desc")}</p>

              <ol className="mt-8 space-y-5">
                {steps.map((Icon, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-sky">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold">{t(`lp_commit_${i + 1}_title`)}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/65">{t(`lp_commit_${i + 1}_text`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
