"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Video, CheckCircle, XCircle, Clock, MessageSquare, Check, Trash2, Eye } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { FeedbackModal } from './FeedbackModal';
import { useRouter } from 'next/navigation';

import { Notification } from "@/src/lib/notifications";

interface NotificationDropdownProps {
    notifications: Notification[];
}

export function NotificationDropdown({ notifications: initialNotifications }: NotificationDropdownProps) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        feedback: any;
    }>({ isOpen: false, feedback: null });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Atualizar notificações quando as props mudarem
    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Fechar dropdown ao clicar fora
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
            case 'video_request':
                return <Video size={18} className="text-purple-600" />;
            case 'feedback_approved':
                return <CheckCircle size={18} className="text-green-600" />;
            case 'feedback_rejected':
                return <XCircle size={18} className="text-red-600" />;
            default:
                return <MessageSquare size={18} className="text-blue-600" />;
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

    const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch('/api/candidate/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                // Atualizar localmente
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
            const response = await fetch('/api/candidate/notifications/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                // Remover localmente
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                router.refresh();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
        e.preventDefault();

        // Se for feedback, abrir modal
        if (notification.type === 'feedback_approved' || notification.type === 'feedback_rejected') {
            setFeedbackModal({
                isOpen: true,
                feedback: {
                    status: notification.feedbackData?.status || (notification.type === 'feedback_approved' ? 'APPROVED' : 'REJECTED'),
                    justification: notification.feedbackData?.justification || notification.message,
                    vacancyTitle: notification.vacancyTitle,
                    companyName: notification.companyName,
                    date: notification.date,
                }
            });
            setIsOpen(false);
        } else if (notification.type === 'video_request' && notification.vacancyUuid) {
            // Redirecionar para upload de vídeo
            router.push(`/viewer/vacancy/${notification.vacancyUuid}?action=upload_video`);
            setIsOpen(false);
        }
    };

    const getNotificationTitle = (notification: Notification) => {
        if (notification.type in (t('notifications.types', { returnObjects: true }) as any)) {
            return t(`notifications.types.${notification.type}.title`);
        }
        return notification.title;
    };

    const getNotificationMessage = (notification: Notification) => {
        if (notification.type === 'video_request') {
            return t('notifications.types.video_request.message');
        }
        
        // Se a mensagem for exatamente igual à mensagem padrão em PT (hardcoded no backend),
        // assumimos que é uma mensagem padrão e traduzimos.
        // Se for diferente, é uma mensagem personalizada (justificativa) e mostramos como está.
        const defaultMessagesPT = {
            'feedback_approved': 'A empresa aprovou sua candidatura.',
            'feedback_rejected': 'A empresa enviou um feedback sobre sua candidatura.'
        };

        if (notification.type === 'feedback_approved' && notification.message === defaultMessagesPT['feedback_approved']) {
             return t('notifications.types.feedback_approved.default_message');
        }

        if (notification.type === 'feedback_rejected' && notification.message === defaultMessagesPT['feedback_rejected']) {
             return t('notifications.types.feedback_rejected.default_message');
        }

        return notification.message;
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Botão do sininho */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    aria-label={t('notifications.title')}
                >
                    <Bell size={24} className="text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header do dropdown */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-base">{t('notifications.title')}</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                                        {unreadCount} {unreadCount === 1 ? t('notifications.new_one') : t('notifications.new_many')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Lista de notificações */}
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
                                            className={`group p-4 hover:bg-slate-50 transition-colors duration-150 ${
                                                !notification.read ? 'bg-blue-50/30' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
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
                                                        {getNotificationMessage(notification)}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                                                        <span className="font-medium truncate max-w-[120px]">{notification.vacancyTitle}</span>
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

                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {(notification.type === 'feedback_approved' || notification.type === 'feedback_rejected') && (
                                                            <button
                                                                onClick={(e) => handleNotificationClick(notification, e)}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                                                            >
                                                                <Eye size={12} />
                                                                {t('notifications.view_feedback')}
                                                            </button>
                                                        )}
                                                        {notification.type === 'video_request' && (
                                                            <button
                                                                onClick={(e) => handleNotificationClick(notification, e)}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                                                            >
                                                                <Video size={12} />
                                                                {t('notifications.send_video')}
                                                            </button>
                                                        )}
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                                                                title={t('notifications.mark_read')}
                                                            >
                                                                <Check size={12} />
                                                                {t('notifications.mark_read')}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(notification.id, e)}
                                                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer ml-auto"
                                                            title={t('notifications.delete')}
                                                        >
                                                            <Trash2 size={12} />
                                                            {t('notifications.delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer - Ver todas */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-100 bg-slate-50">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                                >
                                    {t('notifications.view_all')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Custom scrollbar styles */}
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
            </div>

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false, feedback: null })}
                feedback={feedbackModal.feedback}
            />
        </>
    );
}
