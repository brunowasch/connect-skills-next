"use client";

import React, { useEffect } from 'react';
import { X, Trash2, Bell, Video, UserPlus, Clock, Check, Eye } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { Notification } from "@/src/lib/notifications";

interface AllNotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (notificationId: string, e: React.MouseEvent) => Promise<void>;
    onDelete: (notificationId: string, e: React.MouseEvent) => Promise<void>;
    onClearAll: (e: React.MouseEvent) => Promise<void>;
    onNotificationClick: (notification: Notification, e: React.MouseEvent) => void;
}

export function AllNotificationsModal({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onDelete,
    onClearAll,
    onNotificationClick
}: AllNotificationsModalProps) {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'video_received':
                return <Video size={20} className="text-purple-600" />;
            case 'new_candidate':
                return <UserPlus size={20} className="text-blue-600" />;
            default:
                return <Bell size={20} className="text-slate-600" />;
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

    const getNotificationTitle = (notification: Notification) => {
        if (notification.type === 'new_candidate') return t('notifications.company_notifications.new_candidate_title', 'Nova Candidatura');
        if (notification.type === 'video_received') return t('notifications.company_notifications.video_received_title', 'Vídeo Recebido');
        return notification.title;
    };

    const getNotificationMessage = (notification: Notification) => {
        if (notification.type === 'new_candidate') {
            return t('notifications.company_notifications.new_candidate_message', {
                candidateName: notification.candidateName || 'Candidato',
                vacancyTitle: notification.vacancyTitle || 'Vaga'
            });
        }
        if (notification.type === 'video_received') {
            return t('notifications.company_notifications.video_received_message', {
                candidateName: notification.candidateName || 'Candidato'
            });
        }
        return notification.message;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'), {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{t('notifications.all_notifications', 'Todas as Notificações')}</h2>
                            <p className="text-sm text-slate-500">
                                {notifications.length} {notifications.length === 1 ? t('notifications.notification', 'notificação') : t('notifications.notifications', 'notificações')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <button
                                onClick={onClearAll}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">{t('notifications.clear_all', 'Limpar tudo')}</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4 custom-scrollbar flex-1 bg-slate-50/50">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Bell size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">{t('notifications.empty_title', 'Tudo limpo por aqui!')}</h3>
                            <p className="max-w-xs mx-auto">{t('notifications.empty_description', 'Você não tem novas notificações no momento.')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`group relative bg-white p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${!notification.read ? 'border-indigo-100 shadow-sm' : 'border-slate-100 opacity-90'
                                        }`}
                                >
                                    {!notification.read && (
                                        <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                                    )}

                                    <button
                                        onClick={(e) => onDelete(notification.id, e)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                                        title={t('notifications.delete', 'Excluir')}
                                    >
                                        <X size={16} />
                                    </button>

                                    <div
                                        className="flex items-start gap-4 cursor-pointer pr-8"
                                        onClick={(e) => onNotificationClick(notification, e)}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${getNotificationBgColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                <h4 className={`text-base ${!notification.read ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                                                    {getNotificationTitle(notification)}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium whitespace-nowrap">
                                                    <Clock size={12} />
                                                    {formatDate(notification.date)}
                                                </div>
                                            </div>

                                            <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                                                {getNotificationMessage(notification)}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                {notification.candidateName && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        {notification.candidateName}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {notification.vacancyTitle}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => onNotificationClick(notification, e)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {notification.type === 'video_received' ? (
                                                        <>
                                                            <Video size={14} />
                                                            {t('notifications.view_video', 'Ver Vídeo')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye size={14} />
                                                            {t('notifications.view_details', 'Ver Detalhes')}
                                                        </>
                                                    )}
                                                </button>

                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => onMarkAsRead(notification.id, e)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                                        title={t('notifications.mark_read', 'Marcar como lida')}
                                                    >
                                                        <Check size={14} />
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 cursor-pointer"
                    >
                        {t('common.close', 'Fechar')}
                    </button>
                </div>
            </div>
        </div>
    );
}
