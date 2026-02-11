'use client';

import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, User, Briefcase } from 'lucide-react';
import { ExpiredVideo } from '@/src/lib/companyRestrictions';

interface CompanyBlockedProps {
    expiredVideos: ExpiredVideo[];
}

export default function CompanyBlocked({ expiredVideos }: CompanyBlockedProps) {
    const { t } = useTranslation();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 fi">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white leading-tight">{t('companyBlocked.title')}</h1>
                        <p className="text-red-100 text-sm">{t('companyBlocked.subtitle')}</p>
                    </div>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-800">
                        <p>{t('companyBlocked.warning.description')}</p>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <Clock className="w-4 h-4" />
                        {t('companyBlocked.pendingVideos.title')} ({expiredVideos.length})
                    </h3>

                    <div className="space-y-3">
                        {expiredVideos.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-red-300 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-gray-900">{video.vacancyTitle}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <User className="w-3 h-3" />
                                            <span>{video.candidateName}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded inline-block">
                                            {t('companyBlocked.pendingVideos.expired')}: {formatDate(video.expiresAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-end">
                                    <a
                                        href={`/company/vacancies/${video.vacancyUuid}/ranking`}
                                        className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 font-medium"
                                    >
                                        {t('companyBlocked.pendingVideos.evaluateNow')}
                                        <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Instructions Compactas */}
                    <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex gap-2 items-start bg-gray-50 p-3 rounded">
                            <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{t('companyBlocked.instructions.title')}: 1. {t('companyBlocked.instructions.step1')} 2. {t('companyBlocked.instructions.step2')} 3. {t('companyBlocked.instructions.step3')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
