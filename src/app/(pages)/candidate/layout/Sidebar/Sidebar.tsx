"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBriefcase, FaUser, FaSignOutAlt, FaQuestionCircle, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { ContactForm } from "@/src/app/_components/ContactForm/ContactForm";

interface SidebarProps {
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
    isCollapsed?: boolean;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen, isCollapsed = false }: SidebarProps) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();

    const [logoutOpen, setLogoutOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const navItems = [
        { label: t("sidebar_home"), href: "/candidate/dashboard", icon: FaHome },
        { label: t("sidebar_vacancies"), href: "/candidate/vacancies", icon: FaBriefcase },
        { label: t("sidebar_mentorings", "Mentorias"), href: "/candidate/mentorships", icon: FaCalendarAlt },
        { label: t("sidebar_profile"), href: "/candidate/profile", icon: FaUser },
    ];

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.clear();
        setLogoutOpen(false);
        setMobileOpen?.(false);
        router.push("/");
    };

    return (
        <>
            {mobileOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        zIndex: 40,
                    }}
                    className="lg:hidden"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                />
            )}

            <aside
                style={{
                    backgroundColor: "#ffffff",
                    color: "#cbd5e1",
                    width: isCollapsed ? "5rem" : "16rem",
                    minWidth: isCollapsed ? "5rem" : "16rem",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.25)",
                    overflowY: "auto",
                    transition: "width 0.3s, min-width 0.3s",
                }}
                className={`sidebar ${mobileOpen ? "open" : ""}`}
            >


                <div>
                    <div
                        style={{
                            display: "flex",
                            height: "5rem",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: isCollapsed ? "0 0.5rem" : "0 1.5rem",
                        }}
                    >
                        <Link href="/candidate/dashboard">
                            <div style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "0.5rem", padding: "0.5rem" }}>
                                {!isCollapsed ? (
                                    <Image
                                        src="/img/logos/logo-connect-skills.png"
                                        alt="Connect Skills"
                                        width={160}
                                        height={40}
                                        priority
                                        style={{ height: "auto", width: "16rem" }}
                                    />
                                ) : (
                                    <Image
                                        src="/img/logos/icon.png"
                                        alt="Connect Skills Icon"
                                        width={40}
                                        height={40}
                                        priority
                                        style={{ height: "auto", width: "2.5rem" }}
                                    />
                                )}
                            </div>
                        </Link>
                    </div>

                    <nav style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem", padding: isCollapsed ? "0 0.5rem" : "0 1rem" }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: isCollapsed ? "center" : "flex-start",
                                        gap: isCollapsed ? "0" : "0.75rem",
                                        borderRadius: "0.75rem",
                                        padding: "0.75rem",
                                        fontWeight: 500,
                                        fontSize: "1rem",
                                        transition: "all 0.2s",
                                        backgroundColor: isActive ? "#2563eb" : "transparent",
                                        color: isActive ? "#ffffff" : "#94a3b8",
                                        boxShadow: isActive ? "0 0.625rem 0.93rem -0.18rem rgba(30, 64, 175, 0.5)" : "none",
                                    }}
                                    onClick={() => setMobileOpen && setMobileOpen(false)}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
                                            e.currentTarget.style.color = "#60a5fa";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                            e.currentTarget.style.color = "#94a3b8";
                                        }
                                    }}
                                >
                                    <Icon style={{ fontSize: "1.25rem", color: isActive ? "#ffffff" : "#64748b" }} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div style={{ padding: isCollapsed ? "1rem 0.5rem" : "1rem", display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        title={isCollapsed ? t('sidebar_help', 'Ajuda') : undefined}
                        className="group"
                        style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: isCollapsed ? "center" : "flex-start",
                            gap: isCollapsed ? "0" : "0.75rem",
                            borderRadius: "0.75rem",
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: 500,
                            fontSize: "1rem",
                            transition: "all 0.2s",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() => setHelpOpen(true)}
                    >
                        <div
                            className="flex items-center gap-3 lg:mt-0 w-full"
                            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                        >
                            <div className="flex items-center justify-center rounded-lg bg-blue-100 p-2 group-hover:bg-blue-600 transition-colors duration-300">
                                <FaQuestionCircle className="text-blue-600 group-hover:text-white transition-colors duration-300" style={{ fontSize: "1.25rem" }} />
                            </div>
                            {!isCollapsed && (
                                <span className="text-slate-500 font-medium group-hover:text-blue-600 transition-colors duration-300">
                                    {t('sidebar_help', 'Ajuda')}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        title={isCollapsed ? t("sidebar_logout") : undefined}
                        onClick={() => setLogoutOpen(true)}
                        style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: isCollapsed ? "center" : "flex-start",
                            gap: isCollapsed ? "0" : "0.75rem",
                            borderRadius: "0.75rem",
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: 500,
                            fontSize: "1rem",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "0.5rem",
                                backgroundColor: "#f76363ff",
                                padding: "0.5rem",
                            }}
                        >
                            <FaSignOutAlt className="text-white" style={{ fontSize: "1.25rem" }} />
                        </div>
                        {!isCollapsed && (
                            <span className="text-red-500 hover:text-red-600 transition">
                                {t("sidebar_logout")}
                            </span>
                        )}
                    </button>

                </div>
            </aside>
            {logoutOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                    onClick={() => setLogoutOpen(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-slate-900">
                            {t("logout_modal_title")}
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            {t("logout_modal_desc")}
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setLogoutOpen(false)}
                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition"
                            >
                                {t("logout_modal_cancel")}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-red-700 transition"
                            >
                                {t("logout_modal_confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {helpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                    onClick={() => setHelpOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fadeIn relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setHelpOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <FaTimes />
                        </button>
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                            {t("sidebar_help", "Ajuda")}
                        </h2>
                        <ContactForm variant="compact" defaultUserType="candidate" />
                    </div>
                </div>
            )}
        </>
    );
}