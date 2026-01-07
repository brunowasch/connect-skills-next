"use client";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export function Header() {
  
  return (
    <nav className="fixed top-0 z-50 w-full bg-[#F2F4F7]">
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
          <a
            href="https://wa.me/5551992179330"
            target="_blank"
            className="mt-2 flex items-center gap-2 font-medium text-black hover:text-green-600 lg:mt-0"
          >
            <FaWhatsapp className="text-xl text-[#25d366]" />
            WhatsApp
          </a>
        </div>
    </nav>
  );
}
