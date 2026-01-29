"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#F9FAFB] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6
                            flex flex-col items-center gap-4
                            sm:flex-row sm:justify-between sm:gap-6">

                {/* Logo + Copyright */}
                <div className="flex items-center gap-2">
                    <Link href="/candidate/dashboard">
                        <Image
                            src="/img/logos/icon.png"
                            alt="Connect Skills"
                            width={32}
                            height={32}
                            priority
                            className="w-8 h-auto"
                        />
                    </Link>
                    <p className="text-sm text-gray-500 text-center sm:text-left">
                        © 2026 Connect Skills. {t("footer_rights_reserved")}
                    </p>
                </div>

                {/* Links */}
                <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <Link href="/terms" className="hover:text-blue-500 hover:underline">
                        {t("footer_terms")}
                    </Link>
                    <Link href="/privacy" className="hover:text-blue-500 hover:underline">
                        {t("footer_privacy")}
                    </Link>
                    <Link href="/cookies" className="hover:text-blue-500 hover:underline">
                        {t("footer_cookies")}
                    </Link>
                    <Link href="/help" className="hover:text-blue-500 hover:underline">
                        {t("footer_help")}
                    </Link>
                    <Link href="/contact" className="hover:text-blue-500 hover:underline">
                        {t("footer_contact")}
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
