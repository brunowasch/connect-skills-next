"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Video, UserPlus, Clock, X, Trash2, Check, Eye } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';

import { Notification } from "@/src/lib/notifications";
import { AllNotificationsModal } from './AllNotificationsModal';

interface NotificationDropdownProps {
    notifications: Notification[];
}

export function NotificationDropdown({ notifications: initialNotifications }: NotificationDropdownProps) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isAllNotificationsOpen, setIsAllNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'video_received':
                return <Video size={18} className="text-purple-600" />;
            case 'new_candidate':
                return <UserPlus size={18} className="text-blue-600" />;
            default:
                return <Bell size={18} className="text-slate-600" />;
        }
    };

    const getNotificationBgColor = (type: string) => {
        switch (type) {
            case 'video_received':
                return 'bg-purple-50 border-purple-100';
            case 'new_candidate':
                return 'bg-blue-50 border-blue-100';
            default:
                return 'bg-slate-50 border-slate-100';
        }
    };

    const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch('/api/company/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, read: true } : n
                    )
                );
                router.refresh();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch('/api/company/notifications/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                router.refresh();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleClearAll = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch('/api/company/notifications/clear-all', {
                method: 'POST',
            });

            if (response.ok) {
                setNotifications([]);
                router.refresh();
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
        e.preventDefault();

        if (!notification.read) {
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );

            fetch('/api/company/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId: notification.id }),
            }).then((response) => {
                if (response.ok) {
                    router.refresh();
                }
            }).catch((error) => {
                console.error('Error marking notification as read:', error);
            });
        }

        if (notification.vacancyUuid) {
            router.push(`/company/vacancies/${notification.vacancyUuid}/ranking`);
            setIsOpen(false);
            return;
        } else if (notification.vacancyId) {

            if (notification.vacancyUuid) {
                router.push(`/company/vacancies/${notification.vacancyUuid}/ranking`);
                setIsOpen(false);
            } else {
                console.warn("Notification has no vacancyUuid, cannot redirect to ranking safely.");
            }
        }
    };

    const getNotificationTitle = (notification: Notification) => {
        if (notification.type === 'new_candidate') return t('company_notifications.new_candidate_title', 'Nova Candidatura');
        if (notification.type === 'video_received') return t('company_notifications.video_received_title', 'Vídeo Recebido');
        return notification.title;
    };

    // Helper function for date formatting
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'), {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="notification-btn relative p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                aria-label={t('notifications.title')}
            >
                <Bell size={24} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-base">{t('notifications.title')}</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                                        {unreadCount} {unreadCount === 1 ? t('notifications.new_one') : t('notifications.new_many')}
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer notification-action-btn"
                                >
                                    {t('notifications.clear_all')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto text-slate-400">
                                    <Bell size={24} />
                                </div>
                                <p className="text-sm text-slate-500">{t('notifications.empty')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.slice(0, 5).map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`group relative p-4 hover:bg-slate-50 transition-colors duration-150 ${!notification.read ? 'bg-blue-50/30' : ''
                                            }`}
                                    >
                                        <button
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer notification-action-btn"
                                            title={t('notifications.delete')}
                                        >
                                            <X size={14} />
                                        </button>

                                        <div
                                            className="flex items-start gap-3 cursor-pointer notification-content"
                                            onClick={(e) => handleNotificationClick(notification, e)}
                                        >
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationBgColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                                                        {getNotificationTitle(notification)}
                                                        {!notification.read && (
                                                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </h4>
                                                </div>

                                                <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                                                    {notification.candidateName && (
                                                        <>
                                                            <span className="font-medium truncate max-w-[100px]">{notification.candidateName}</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span className="font-medium truncate max-w-[120px]">{notification.vacancyTitle}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatDate(notification.date)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => handleNotificationClick(notification, e)}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                                                    >
                                                        {notification.type === 'video_received' ? (
                                                            <>
                                                                <Video size={12} />
                                                                {t('notifications.view_video', 'Ver Vídeo')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye size={12} />
                                                                {t('notifications.view_details', 'Ver Detalhes')}
                                                            </>
                                                        )}
                                                    </button>

                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                                            title={t('notifications.mark_read', 'Marcar como lida')}
                                                        >
                                                            <Check size={12} />
                                                            {t('notifications.mark_read', 'Marcar como lida')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsAllNotificationsOpen(true);
                                }}
                                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                            >
                                {t('notifications.view_all')}
                            </button>
                        </div>
                    )}
                </div>
            )}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            <AllNotificationsModal
                isOpen={isAllNotificationsOpen}
                onClose={() => setIsAllNotificationsOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onClearAll={handleClearAll}
                onNotificationClick={(n, e) => {
                    handleNotificationClick(n, e);
                    setIsAllNotificationsOpen(false);
                }}
            />
        </div >
    );
}
