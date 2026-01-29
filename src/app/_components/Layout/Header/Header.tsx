"use client";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();

  return (
    <nav className="z-50 w-full bg-[#F2F4F7]">
      <div className="mx-auto flex min-h-[13vh] max-w-7xl items-center justify-between px-4">

        <Link href="/">
          <Image
            src="/img/logos/logo-connect-skills.png"
            alt="Logo Connect Skills"
            width={180}
            height={20}
            className="w-[180px] lg:w-[200px]"
            priority
          />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="https://wa.me/5551992179330"
            target="_blank"
            className="flex items-center gap-2 font-medium text-black hover:text-green-600 lg:mt-0"
          >
            <FaWhatsapp className="text-xl text-[#25d366]" />
            <span className="hidden sm:inline">{t("whatsapp")}</span>
          </a>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
