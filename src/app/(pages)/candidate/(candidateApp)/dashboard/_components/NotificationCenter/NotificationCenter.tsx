"use client";

import React from 'react';
import Link from 'next/link';
import { Bell, Video, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface Notification {
    id: string;
    type: 'video_request' | 'feedback_approved' | 'feedback_rejected' | 'general';
    title: string;
    message: string;
    vacancyTitle: string;
    vacancyUuid?: string;
    companyName: string;
    date: Date;
    read: boolean;
}

interface NotificationCenterProps {
    notifications: Notification[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
    const { t, i18n } = useTranslation();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'video_request':
                return <Video size={20} className="text-purple-600" />;
            case 'feedback_approved':
                return <CheckCircle size={20} className="text-green-600" />;
            case 'feedback_rejected':
                return <XCircle size={20} className="text-red-600" />;
            default:
                return <MessageSquare size={20} className="text-blue-600" />;
        }
    };

    const getNotificationBgColor = (type: string) => {
        switch (type) {
            case 'video_request':
                return 'bg-purple-50 border-purple-100';
            case 'feedback_approved':
                return 'bg-green-50 border-green-100';
            case 'feedback_rejected':
                return 'bg-red-50 border-red-100';
            default:
                return 'bg-blue-50 border-blue-100';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (notifications.length === 0) {
        return (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhuma Notificação</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Você não tem notificações no momento.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 relative">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Notificações</h3>
                </div>
            </div>

            <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar max-h-[500px]">
                {notifications.map((notification) => {
                    const linkHref = notification.type === 'video_request' && notification.vacancyUuid
                        ? `/viewer/vacancy/${notification.vacancyUuid}?action=upload_video`
                        : '#';

                    return (
                        <Link
                            key={notification.id}
                            href={linkHref}
                            className={`group p-4 sm:p-5 hover:bg-slate-50 transition-all duration-200 flex items-start gap-4 ${!notification.read ? 'bg-blue-50/30' : ''
                                }`}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationBgColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                                        {notification.title}
                                        {!notification.read && (
                                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </h4>
                                </div>

                                <p className="text-xs text-slate-600 mb-2">
                                    {notification.message}
                                </p>

                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="font-medium">{notification.vacancyTitle}</span>
                                    <span>•</span>
                                    <span>{notification.companyName}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(notification.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'), {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="bg-slate-50 p-3 text-center border-t border-slate-100 mt-auto">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {unreadCount > 0 ? `${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas as notificações lidas'}
                </p>
            </div>
        </div>
    );
}
