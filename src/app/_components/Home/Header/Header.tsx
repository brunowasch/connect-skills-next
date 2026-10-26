"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../Layout/LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("inicio");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -50% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      if (window.scrollY < 50) {
        setActiveSection("inicio");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navItems = [
    { label: t("lp_nav_how"), href: "#how", id: "how" },
    { label: t("lp_nav_features"), href: "#features", id: "features" },
    { label: t("lp_nav_audiences"), href: "#audiences", id: "audiences" },
    { label: t("lp_nav_ai"), href: "#ai", id: "ai" },
    { label: t("lp_nav_faq"), href: "#faq", id: "faq" },
    { label: t("contato"), href: "#contact", id: "contact" },
  ];

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? "border-b border-slate-200 bg-white" : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => {
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="shrink-0"
        >
          <Image
            src="/img/logos/logo-connect-skills.svg"
            alt="Connect Skills"
            width={190}
            height={42}
            className="h-auto w-[160px] lg:w-[190px]"
            priority
          />
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden xl:block">
          <ul className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`block rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${isActive ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-brand-mist hover:text-brand-navy"
                      }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xl:flex items-center">
            <LanguageSwitcher />
          </div>

          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-mist sm:inline-flex"
          >
            {t("login")}
          </Link>

          <Link
            href="/register"
            className="group hidden items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue sm:inline-flex"
          >
            {t("lp_create_account")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Botão do menu mobile */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? t("lp_close_menu") : t("lp_open_menu")}
            aria-expanded={open}
            className="rounded-full p-2.5 text-brand-navy transition-colors hover:bg-brand-mist xl:hidden cursor-pointer"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`overflow-hidden border-t border-slate-200/70 bg-white transition-[max-height,opacity] duration-300 xl:hidden ${open ? "max-h-[85vh] opacity-100" : "max-h-0 border-transparent opacity-0"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-lg font-semibold ${activeSection === item.id ? "bg-brand-mist text-brand-navy" : "text-slate-700"
                    }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="rounded-full border border-brand-navy px-4 py-3 text-center font-semibold text-brand-navy"
            >
              {t("login")}
            </Link>
            <Link href="/register" className="rounded-full bg-brand-navy px-4 py-3 text-center font-semibold text-white">
              {t("register")}
            </Link>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <LanguageSwitcher align="left" />
          </div>
        </div>
      </div>
    </header>
  );
}
