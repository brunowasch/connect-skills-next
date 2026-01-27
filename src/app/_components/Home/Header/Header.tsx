"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../Layout/LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
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
      if (window.scrollY < 50) {
        setActiveSection("inicio");
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navItems = [
    { label: t("inicio"), href: "/", id: "inicio" },
    { label: t("sobre"), href: "#about", id: "about" },
    { label: t("contato"), href: "#contact", id: "contact" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#F2F4F7]">
      <div className="mx-auto flex min-h-[13vh] max-w-7xl items-center justify-between px-4 relative">
        {/* Logo */}
        <Link href="/" onClick={() => window.scrollTo({ top: 0 })}>
          <Image
            src="/img/logos/logo-connect-skills.png"
            alt="Logo Connect Skills"
            width={180}
            height={20}
            className="w-[180px] lg:w-[200px]"
            priority
          />
        </Link>

        {/* Menu (Desktop + Mobile) */}
        <div
          className={`${open ? "flex" : "hidden"
            } absolute left-0 top-full w-full flex-col gap-4 bg-[#F2F4F7] p-4 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:w-auto lg:flex lg:flex-row lg:items-center lg:gap-8 lg:bg-transparent lg:p-0`}
        >
          <ul className="flex flex-col gap-3 lg:flex-row lg:gap-6">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                      if (item.href === "/") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={`relative font-medium transition-colors duration-300
                      ${isActive
                        ? "text-blue-500 after:w-full"
                        : "text-black hover:text-blue-400"
                      }
                      after:absolute after:-bottom-1 after:left-0 after:h-[2px]
                      after:bg-blue-400 after:transition-all after:duration-300
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <a
            href="https://wa.me/5551992179330"
            target="_blank"
            className="mt-2 flex items-center gap-2 font-medium text-black hover:text-green-600 lg:mt-0"
          >
            <FaWhatsapp className="text-xl text-[#25d366]" />
            {t("whatsapp")}
          </a>
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Action Buttons & Language Switcher (Right Side) */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setOpen(!open)} className="lg:hidden text-2xl text-gray-700 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
