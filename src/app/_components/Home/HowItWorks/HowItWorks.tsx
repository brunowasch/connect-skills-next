"use client";

import { useState } from "react";
import {
  BrainCircuit,
  Building2,
  FileCheck2,
  FilePenLine,
  Search,
  UserRound,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import { Reveal } from "../Reveal/Reveal";

type Journey = "candidate" | "company";

// Cada passo tem um "nome de arquivo" decorativo na barra da janela
const journeys: Record<Journey, { file: string; icon: LucideIcon }[]> = {
  candidate: [
    { file: "perfil.exe", icon: UserRound },
    { file: "soft-skills.doc", icon: BrainCircuit },
    { file: "vagas.match", icon: Search },
    { file: "pitch.mp4", icon: Video },
  ],
  company: [
    { file: "empresa.exe", icon: Building2 },
    { file: "vaga.doc", icon: FilePenLine },
    { file: "ranking.ai", icon: UsersRound },
    { file: "proposta.pdf", icon: FileCheck2 },
  ],
};

export function HowItWorks() {
  const { t } = useTranslation();
  const [journey, setJourney] = useState<Journey>("candidate");
  const prefix = journey === "candidate" ? "lp_how_c" : "lp_how_e";

  const tabs: { id: Journey; label: string }[] = [
    { id: "candidate", label: t("lp_how_tab_candidate") },
    { id: "company", label: t("lp_how_tab_company") },
  ];

  return (
    <section id="how" className="scroll-mt-24 border-y border-slate-200 bg-brand-surface py-20 lg:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          align="center"
          kicker={t("lp_how_kicker")}
          title={t("lp_how_title")}
          description={t("lp_how_desc")}
        />

        <Reveal delay={100} className="mt-10 flex justify-center">
          <div role="tablist" className="inline-flex rounded-full border border-slate-200 bg-white p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={journey === tab.id}
                onClick={() => setJourney(tab.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:px-6 cursor-pointer ${journey === tab.id ? "bg-brand-navy text-white" : "text-slate-600 hover:text-brand-navy"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <ol key={journey} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journeys[journey].map(({ file, icon: Icon }, i) => (
            <Reveal as="li" key={file} delay={i * 110} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-colors duration-300 hover:border-brand-navy/40">
                {/* Barra de título no estilo janela */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-slate-500">{file}</span>
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-sky/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-navy/70" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-blue transition-colors duration-300 group-hover:bg-brand-navy group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-bold text-slate-300">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-brand-ink">{t(`${prefix}_${i + 1}_title`)}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{t(`${prefix}_${i + 1}_text`)}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
