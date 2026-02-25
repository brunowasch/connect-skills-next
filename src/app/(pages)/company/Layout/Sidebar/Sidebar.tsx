"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBriefcase, FaUser, FaSignOutAlt, FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface SidebarProps {
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();

    const [logoutOpen, setLogoutOpen] = useState(false);

    const navItems = [
        { label: t("sidebar_home"), href: "/company/dashboard", icon: FaHome },
        { label: t("sidebar_vacancies"), href: "/company/vacancies", icon: FaBriefcase },
        { label: t("sidebar_profile"), href: "/company/profile", icon: FaUser },
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
                    width: "16rem",
                    minWidth: "16rem",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 1.5rem 3rem -0.75rem rgba(0, 0, 0, 0.25)",
                    overflowY: "auto",
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
                            padding: "0 1.5rem",
                        }}
                    >
                        <Link href="/company/dashboard" className="header-logo-link">
                            <div style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "0.5rem", padding: "0.5rem" }}>
                                <Image
                                    src="/img/logos/logo-connect-skills.png"
                                    alt="Connect Skills"
                                    width={160}
                                    height={40}
                                    priority
                                    style={{ height: "auto", width: "16rem" }}
                                />
                            </div>
                        </Link>
                    </div>

                    <nav style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0 1rem" }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (

                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="sidebar-nav-link"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        borderRadius: "0.75rem",
                                        padding: "0.75rem 1rem",
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
                                    <Icon style={{ fontSize: "1.125rem", color: isActive ? "#ffffff" : "#64748b" }} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div style={{ padding: "1rem" }}>
                    <button
                        className="sidebar-nav-link"
                        style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            gap: "0.75rem",
                            borderRadius: "0.75rem",
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontWeight: 500,
                            fontSize: "1rem",
                            color: "#25d366",
                            transition: "all 0.2s",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#c7f0d6ff";
                            e.currentTarget.style.color = "#25d366";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#25d366";
                        }}
                    >
                        <a
                            href="https://wa.me/5551992179330"
                            target="_blank"
                            className="sidebar-nav-link mt-2 flex items-center gap-2 font-medium text-black hover:text-green-600 lg:mt-0"
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "0.5rem",
                                backgroundColor: "#25d366",
                                padding: "0.5rem",
                            }}>
                                <FaWhatsapp className="text-white" style={{ fontSize: "1rem" }} />
                            </div>
                            <span className="text-green-500 hover:text-green-600 transition">
                                {t("whatsapp")}
                            </span>
                        </a>
                    </button>
                    <button
                        onClick={() => setLogoutOpen(true)}
                        className="sidebar-nav-link"
                        style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            gap: "0.75rem",
                            borderRadius: "0.75rem",
                            padding: "0.75rem 1rem",
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
                            <FaSignOutAlt className="text-white" style={{ fontSize: "1rem" }} />
                        </div>
                        <span className="text-red-500 hover:text-red-600 transition">
                            {t("sidebar_logout")}
                        </span>
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
                                className="logout-modal-btn flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition"
                            >
                                {t("logout_modal_cancel")}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="logout-modal-btn flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-red-700 transition"
                            >
                                {t("logout_modal_confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}