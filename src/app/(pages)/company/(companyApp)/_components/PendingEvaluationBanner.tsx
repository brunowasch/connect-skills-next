'use client';

import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { ExpiredVideo } from '@/src/lib/companyRestrictions';

interface PendingEvaluationBannerProps {
    expiredVideos: ExpiredVideo[];
}

export default function PendingEvaluationBanner({ expiredVideos }: PendingEvaluationBannerProps) {
    const { t } = useTranslation();

    if (expiredVideos.length === 0) return null;

    // Pega apenas o primeiro vídeo pendente
    const firstVideo = expiredVideos[0];

    return (
        <div className="relative z-30 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg lg:ml-64 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                        <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">
                                {t('companyBlocked.pendingEvaluation.title', 'Você tem candidatos pendentes de avaliação')}
                            </p>
                            <p className="text-xs text-red-100">
                                {t('companyBlocked.pendingEvaluation.subtitle', 'As funcionalidades estão desabilitadas até a avaliação')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                        <a
                            href={`/company/vacancies/${firstVideo.vacancyUuid}/ranking?pendingCandidate=${firstVideo.candidateId}`}
                            className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm whitespace-nowrap flex-shrink-0 banner-action-btn"
                        >
                            {t('companyBlocked.pendingVideos.evaluateNow')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
