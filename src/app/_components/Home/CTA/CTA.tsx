"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "../Reveal/Reveal";

export function CTA() {
  const { t } = useTranslation();

  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-brand-navy px-6 py-20 text-center text-white sm:px-12 lg:py-24">
          <div>
            <h2 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {t("lp_final_title_1")} <span className="text-brand-sky">{t("lp_final_title_2")}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">{t("lp_final_desc")}</p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-brand-navy transition-colors hover:bg-brand-mist"
              >
                {t("lp_create_account")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-4 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                {t("lp_have_account")}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
