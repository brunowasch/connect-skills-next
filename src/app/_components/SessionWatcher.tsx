"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SessionWatcher() {
    const router = useRouter();
    const pathname = usePathname();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        const isPublic = pathname === "/login" || pathname === "/login/verify" || pathname === "/";

        const getCookie = (name: string) => {
            const matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        };

        const validateSession = async () => {
            const authMode = getCookie("auth_mode");
            const timeUserId = getCookie("time_user_id");
            if (!timeUserId) {
                setIsValidating(false);
                return;
            }

            if (authMode === "persistent") {
                setIsValidating(false);
                return;
            }

            const sessionActive = sessionStorage.getItem("cs_session_active");

            if (sessionActive) {
                setupResponder();
                setIsValidating(false);
                return;
            }
            const channel = new BroadcastChannel("cs_session_sync");
            let receivedReply = false;

            const onMessage = (e: MessageEvent) => {
                if (e.data === "SESSION_ALIVE") {
                    receivedReply = true;
                    console.log("[SessionWatcher] Sessão sincronizada de outra aba.");
                    sessionStorage.setItem("cs_session_active", "true");
                    setupResponder();
                    setIsValidating(false);
                    channel.close();
                }
            };

            channel.addEventListener("message", onMessage);
            channel.postMessage("ASK_SESSION");

            setTimeout(async () => {
                channel.removeEventListener("message", onMessage);

                if (!receivedReply) {
                    console.log("[SessionWatcher] Sessão inválida detectada. Logout forçado.");

                    try {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/login";
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    channel.close();
                }
            }, 500);
        };

        const setupResponder = () => {
            const channel = new BroadcastChannel("cs_session_sync");
            channel.onmessage = (e) => {
                if (e.data === "ASK_SESSION") {
                    if (sessionStorage.getItem("cs_session_active")) {
                        channel.postMessage("SESSION_ALIVE");
                    }
                }
            };
        };

        validateSession();

    }, [pathname, router]);

    if (!isValidating) return null;

    return (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        </div>
    );
}
