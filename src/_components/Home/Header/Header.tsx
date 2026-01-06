"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export function Header() {
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
    { label: "Início", href: "/", id: "inicio" },
    { label: "Sobre", href: "#about", id: "about" },
    { label: "Contato", href: "#contact", id: "contact" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#F2F4F7]">
      <div className="mx-auto flex min-h-[13vh] max-w-7xl items-center justify-between px-4">
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

        {/* Mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-xl"
        >
          ☰
        </button>

        {/* Menu */}
        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 top-full w-full flex-col gap-4 bg-[#F2F4F7] p-4 lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-6 lg:bg-transparent lg:p-0`}
        >
          <ul className="flex flex-col gap-3 lg:flex-row lg:gap-6">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`relative font-medium transition-colors duration-300
                      ${
                        isActive
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
            WhatsApp
          </a>
        </div>
      </div>
    </nav>
  );
}
