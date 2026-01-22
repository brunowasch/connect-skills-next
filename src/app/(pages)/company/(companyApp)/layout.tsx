"use client";

import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "../Layout/Sidebar/Sidebar";
import Image from "next/image";
import { Footer } from "../Layout/Footer/Footer";
import { GlobalToast } from "./_components/GlobalToast";

import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <GlobalToast />
            <Sidebar
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
            />

            <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">

                <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                        >
                            <FaBars className="text-xl" />
                        </button>
                        <Image
                            src="/img/logos/logo-connect-skills.png"
                            alt="Connect Skills"
                            width={120}
                            height={30}
                            priority
                            style={{ height: "auto", width: "8rem" }}
                        />
                    </div>

                    <div className="hidden lg:block text-slate-500 font-medium">
                        {/* Espaço para migalhas de pão ou título no futuro */}
                    </div>

                    <div className="flex items-center">
                        <LanguageSwitcher />
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden p-4 lg:p-8">
                    <div className="mx-auto max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}