"use client";

import { Bell, CalendarDays, FileCheck2, GraduationCap, Heart, Link2, MessageSquareText, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

const features = [Video, MessageSquareText, CalendarDays, GraduationCap, FileCheck2, Bell, Link2, Heart];

export function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <SectionHeading kicker={t("lp_features_kicker")} title={t("lp_features_title")} />
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed text-slate-600 lg:pb-2">{t("lp_features_desc")}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((Icon, i) => (
            <Reveal key={i} delay={(i % 4) * 90} className="h-full">
              <article className="group h-full rounded-3xl border border-slate-200 bg-white p-7 transition-colors duration-300 hover:border-brand-navy/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-blue transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-brand-ink">{t(`lp_feature_${i + 1}_title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(`lp_feature_${i + 1}_text`)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
