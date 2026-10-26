"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LandingFooter() {
  const { t } = useTranslation();

  const navLinks = [
    { label: t("lp_nav_how"), href: "#how" },
    { label: t("lp_nav_features"), href: "#features" },
    { label: t("lp_nav_audiences"), href: "#audiences" },
    { label: t("lp_nav_ai"), href: "#ai" },
    { label: t("lp_nav_faq"), href: "#faq" },
    { label: t("contato"), href: "#contact" },
  ];

  const legalLinks = [
    { label: t("footer_terms"), href: "/terms" },
    { label: t("footer_privacy"), href: "/privacy" },
    { label: t("footer_cookies"), href: "/cookies" },
  ];

  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Image
              src="/img/logos/logo-connect-skills-white.svg"
              alt="Connect Skills"
              width={220}
              height={49}
              className="h-auto w-[200px]"
            />
            <p className="mt-6 text-2xl font-bold leading-snug">{t("lp_footer_tagline")}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">{t("footer_desc")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-sky">{t("lp_footer_nav")}</h5>
              <ul className="mt-5 space-y-3 text-sm">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/75 transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-sky">{t("footer_links")}</h5>
              <ul className="mt-5 space-y-3 text-sm">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/75 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/login" className="text-white/75 transition hover:text-white">
                    {t("login")}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-white/75 transition hover:text-white">
                    {t("register")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-sky">{t("footer_support")}</h5>
              <div className="mt-5 inline-flex rounded-2xl bg-white px-5 py-4">
                <Image
                  src="/img/sponsors/LOOP_HOST.svg"
                  alt="Loop Host"
                  width={140}
                  height={25}
                  className="h-auto w-[140px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/50 sm:flex-row sm:items-center">
          <p>Connect Skills © 2025 - 2026. {t("footer_rights_reserved")}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 font-semibold text-white/75 transition hover:text-white cursor-pointer"
          >
            {t("lp_back_to_top")}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 transition group-hover:-translate-y-0.5 group-hover:border-white">
              <ArrowUp className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
