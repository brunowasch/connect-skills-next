"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaHome, FaBriefcase, FaUser, FaSignOutAlt, FaWhatsapp } from "react-icons/fa";

interface SidebarProps {
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { label: "Início", href: "/pages/company/companyApp/dashboard", icon: FaHome },
        { label: "Vagas", href: "/pages/company/companyApp/vacancies", icon: FaBriefcase },
        { label: "Meu Perfil", href: "/pages/company/companyApp/profile", icon: FaUser },
    ];

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
                    backgroundColor: "#ffffffff",
                    color: "#cbd5e1",
                    width: "16rem",
                    minWidth: "16rem",
                    height: "100vh",
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
                        <Link href="/pages/candidate/candidateApp/dashboard">
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
                            className="mt-2 flex items-center gap-2 font-medium text-black hover:text-green-600 lg:mt-0"
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
                                WhatsApp
                            </span>
                        </a>
                    </button>
                    <button
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
                            color: "#94a3b8",
                            transition: "all 0.2s",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.color = "#f87171";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#fd8e8eff";
                        }}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0.5rem",
                            backgroundColor: "#f76363ff",
                            padding: "0.5rem",
                        }}>
                            <FaSignOutAlt className="text-white" style={{ fontSize: "1rem" }} />
                        </div>
                        <span className="text-red-500 hover:text-red-600 transition">
                            Sair
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}