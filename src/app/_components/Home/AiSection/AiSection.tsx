"use client";

import { ArrowLeftRight, FileText, MessageSquareText, RefreshCw, ScanFace, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

const features = [ScanFace, UsersRound, FileText, MessageSquareText, RefreshCw, ArrowLeftRight];

export function AiSection() {
  const { t } = useTranslation();

  return (
    <section id="ai" className="scroll-mt-24 bg-brand-ink py-20 text-white lg:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-end gap-10 lg:grid-cols-2">
          <SectionHeading tone="dark" kicker={t("lp_ai_kicker")} title={t("lp_ai_title")} />
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed text-white/70 lg:pb-2">{t("lp_ai_desc")}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((Icon, i) => (
            <Reveal key={i} delay={(i % 3) * 100} className="group bg-brand-ink p-8 transition-colors duration-300 hover:bg-white/[0.04] sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 text-brand-sky">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-xl font-bold">{t(`lp_ai_${i + 1}_title`)}</h3>
              <p className="mt-3 leading-relaxed text-white/60">{t(`lp_ai_${i + 1}_text`)}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <p className="mt-8 text-center text-sm text-white/50">{t("lp_ai_note")}</p>
        </Reveal>
      </div>
    </section>
  );
}
