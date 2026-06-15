"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, CalendarCheck, CheckCircle, Clock, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Notification } from "@/src/lib/notifications";

interface Props {
    notifications: Notification[];
}

export function MentorNotificationDropdown({ notifications: initialNotifications }: Props) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => { setNotifications(initialNotifications); }, [initialNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const getIcon = (type: string) => {
        if (type === "interview_confirmed_mentor") return <CalendarCheck size={18} className="text-emerald-600" />;
        if (type === "interview_cancelled_mentor") return <CheckCircle size={18} className="text-red-500" />;
        return <Bell size={18} className="text-slate-600" />;
    };

    const getBg = (type: string) => {
        if (type === "interview_confirmed_mentor") return "bg-emerald-50 border-emerald-100";
        if (type === "interview_cancelled_mentor") return "bg-red-50 border-red-100";
        return "bg-slate-50 border-slate-100";
    };

    const handleMarkAsRead = async (rawId: string, notifId: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await fetch("/api/mentor/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawId }),
            });
            setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
            router.refresh();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (rawId: string, notifId: string, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await fetch("/api/mentor/notifications/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawId }),
            });
            setNotifications((prev) => prev.filter((n) => n.id !== notifId));
            router.refresh();
        } catch (err) { console.error(err); }
    };

    const handleClearAll = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await fetch("/api/mentor/notifications/clear-all", { method: "POST" });
            setNotifications([]);
            router.refresh();
        } catch (err) { console.error(err); }
    };

    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString(
            i18n.language === "en" ? "en-US" : i18n.language === "es" ? "es-ES" : "pt-BR",
            { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
        );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                aria-label={t("notifications.title", "Notificações")}
            >
                <Bell size={24} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed left-2 right-2 top-[80px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-[420px] sm:max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-base">{t("notifications.title", "Notificações")}</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                                        {unreadCount} {unreadCount === 1 ? t('notifications.new_singular', 'nova') : t('notifications.new_plural', 'novas')}
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button onClick={handleClearAll} className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
                                    {t("notifications.clear_all", "Limpar todas")}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto text-slate-400">
                                    <Bell size={24} />
                                </div>
                                <p className="text-sm text-slate-500">{t("notifications.empty", "Nenhuma notificação.")}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.slice(0, 10).map((notification) => {
                                    const rawId = notification.extraData?.rawId;
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group relative p-4 hover:bg-slate-50 transition-colors duration-150 ${!notification.read ? "bg-blue-50/30" : ""}`}
                                        >
                                            <button
                                                onClick={(e) => handleDelete(rawId, notification.id, e)}
                                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>

                                            <div className="flex items-start gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${getBg(notification.type)}`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">
                                                        {notification.title}
                                                        {!notification.read && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />}
                                                    </h4>
                                                    <p className="text-xs text-slate-600 mb-2 line-clamp-3">{notification.message}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {formatDate(notification.date)}
                                                        </span>
                                                    </div>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(rawId, notification.id, e)}
                                                            className="mt-2 flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                                        >
                                                            <Check size={12} />
                                                            {t("notifications.mark_read", "Marcar como lida")}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
