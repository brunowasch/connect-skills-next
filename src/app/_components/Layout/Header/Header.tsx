"use client";
import Image from "next/image";
import Link from "next/link";
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
          <LanguageSwitcher />
          <Link href="/login" className="bg-primary text-white hover:opacity-90 transition px-4 py-2 rounded-lg">
            {t("btn_login")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
