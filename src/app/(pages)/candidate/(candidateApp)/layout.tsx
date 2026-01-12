"use client";

import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "../layout/Sidebar/Sidebar";
import Image from "next/image";
import { Footer } from "@/src/app/(pages)/candidate/layout/Footer/Footer";
import { GlobalToast } from "./_components/GlobalToast";

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <GlobalToast />
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    setMobileOpen={setMobileSidebarOpen}
                />

                <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">
                    <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:hidden">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                        >
                            <FaBars className="text-xl" />
                        </button>
                        <Image
                            src="/img/logos/logo-connect-skills.png"
                            alt="Connect Skills"
                            width={160}
                            height={40}
                            priority
                            style={{ height: "auto", width: "12rem" }}
                        />
                        <div className="w-8" />
                    </header>

                    <main className="flex-1 overflow-x-hidden p-4 lg:p-8">
                        <div className="mx-auto max-w-7xl animate-fade-in">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">
                <Footer />
            </div>
        </>
    );
}
