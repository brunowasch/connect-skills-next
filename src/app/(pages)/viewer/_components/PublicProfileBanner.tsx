"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function PublicProfileBanner({ isLoggedIn }: { isLoggedIn?: boolean }) {
    return (
        <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                {/* Logo + Brand */}
                <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                    <Image
                        src="/img/logos/logo-connect-skills.svg"
                        alt="Logo Connect Skills"
                        width={140}
                        height={40}
                        className="object-contain"
                    />
                </Link>

                {/* Tagline — hidden on mobile */}
                <p className="hidden md:block text-slate-500 text-sm text-center flex-1 px-4">
                    A plataforma que conecta{" "}
                    <span className="font-semibold text-slate-700">talentos</span>,{" "}
                    <span className="font-semibold text-slate-700">empresas</span> e{" "}
                    <span className="font-semibold text-slate-700">mentores</span> profissionais.
                </p>

                {/* CTA */}
                {!isLoggedIn && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Link
                            href="/login"
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-sm shadow-blue-200 whitespace-nowrap"
                        >
                            <Sparkles size={14} />
                            Criar conta grátis
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
