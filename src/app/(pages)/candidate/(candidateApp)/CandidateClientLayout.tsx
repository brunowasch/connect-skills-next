"use client";

import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "../layout/Sidebar/Sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Footer } from "@/src/app/(pages)/candidate/layout/Footer/Footer";
import { GlobalToast } from "./_components/GlobalToast";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

import { NotificationDropdown } from "./_components/NotificationDropdown";
import { Notification } from "@/src/lib/notifications";

export default function CandidateLayout({
    children,
    notifications = []
}: {
    children: React.ReactNode;
    notifications?: Notification[];
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();

    const hideFooterPaths = ["/candidate/edit/area"];
    const shouldHideFooter = hideFooterPaths.includes(pathname);

    return (
        <>
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
                <GlobalToast />

                {/* Sidebar */}
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    setMobileOpen={setMobileSidebarOpen}
                />

                {/* Área principal */}
                <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64 w-full min-w-0 overflow-x-hidden">

                    {/* Header */}
                    <header className="flex h-20 items-center justify-between bg-white px-4 sm:px-6 shadow-sm sticky top-0 z-40 w-full max-w-full">
                        <div className="flex items-center gap-4 lg:hidden">
                            <button
                                onClick={() => setMobileSidebarOpen(true)}
                                className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                            >
                                <FaBars className="text-2xl" />
                            </button>
                            <Image
                                src="/img/logos/logo-connect-skills.png"
                                alt="Connect Skills"
                                width={160}
                                height={40}
                                priority
                                className="w-36 sm:w-40 h-auto"
                            />
                        </div>

                        {/* Espaço vazio em desktop quando sidebar está visível */}
                        <div className="hidden lg:block flex-1" />

                        {/* Language Switcher e Notificações */}
                        <div className="flex items-center gap-4">
                            {pathname === '/candidate/dashboard' && (
                                <>
                                    <NotificationDropdown notifications={notifications} />
                                    <div className="h-6 w-px bg-gray-200" />
                                </>
                            )}
                            <LanguageSwitcher />
                        </div>
                    </header>

                    {/* Conteúdo */}
                    <main className="flex-1 overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 w-full min-w-0">
                        {/* Container fluido */}
                        <div className="w-full max-w-[1400px] mx-auto min-w-0">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Footer */}
            {!shouldHideFooter && (
                <div className="flex flex-col transition-all duration-300 lg:ml-64">
                    <Footer />
                </div>
            )}
        </>
    );
}
