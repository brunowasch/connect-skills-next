"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CalendarCheck, Check, PlayCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../Reveal/Reveal";

export function Hero() {
  const { t } = useTranslation();

  const points = [t("lp_hero_point_1"), t("lp_hero_point_2"), t("lp_hero_point_3")];

  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <h1 className="text-[2.3rem] font-extrabold leading-[0.98] tracking-tight text-brand-ink sm:text-6xl lg:text-[3.5rem] xl:text-[4.5rem]">
            <Reveal as="span" delay={80} className="block">
              <span>{t("lp_hero_title_1")}</span>
            </Reveal>
            <Reveal as="span" delay={160} className="block">
              <span>{t("lp_hero_title_2")}</span>
            </Reveal>
            <Reveal as="span" delay={240} className="block">
              <span className="text-brand-blue">{t("lp_hero_title_3")}</span>
            </Reveal>
          </h1>

          <Reveal delay={320}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">{t("lp_hero_desc")}</p>
          </Reveal>

          <Reveal delay={400} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-blue"
            >
              {t("lp_hero_cta_candidate")}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-brand-navy transition-colors hover:border-brand-navy"
            >
              <Building2 className="h-5 w-5" />
              {t("lp_hero_cta_company")}
            </Link>
          </Reveal>

          <Reveal delay={480}>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative min-w-0 lg:col-span-5">
          <MatchMockup />
        </Reveal>
      </div>
    </section>
  );
}

// Ilustração de produto: um card de candidato com o match calculado pela IA
function MatchMockup() {
  const { t } = useTranslation();
  const match = 94;
  const circumference = 2 * Math.PI * 34;

  const skills = [
    { label: t("lp_mock_skill_1"), value: 96 },
    { label: t("lp_mock_skill_2"), value: 91 },
    { label: t("lp_mock_skill_3"), value: 88 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Image
            src="/img/landing/avatar-john-doe.svg"
            alt={t("lp_mock_name")}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-brand-ink">{t("lp_mock_name")}</p>
            <p className="truncate text-sm text-slate-500">{t("lp_mock_role")}</p>
          </div>
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#EAF4FC" strokeWidth="8" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#15447C"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - match / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold leading-none text-brand-navy">{match}%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">match</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Soft skills</p>
        <ul className="mt-4 space-y-4">
          {skills.map((skill) => (
            <li key={skill.label}>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-700">{skill.label}</span>
                <span className="text-brand-blue">{skill.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-mist">
                <div
                  className="h-full rounded-full bg-brand-navy"
                  style={{ width: `${skill.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-brand-surface p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-dot" />
          <p className="text-sm text-slate-600">{t("lp_mock_ai_note")}</p>
        </div>
      </div>

      {/* Cards de status sobre o card principal */}
      <div className="absolute -top-6 right-0 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:-right-10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CalendarCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand-ink">{t("lp_mock_notif_title")}</p>
          <p className="text-xs text-slate-500">{t("lp_mock_notif_desc")}</p>
        </div>
      </div>

      <div className="absolute -bottom-6 left-0 flex items-center gap-3 rounded-2xl bg-brand-navy px-4 py-3 text-white sm:-left-10">
        <PlayCircle className="h-6 w-6 text-brand-sky" />
        <p className="text-sm font-semibold">{t("lp_mock_video")}</p>
      </div>
    </div>
  );
}
