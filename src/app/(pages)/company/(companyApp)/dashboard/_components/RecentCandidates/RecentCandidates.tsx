"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ChevronRight, Calendar, Star, Camera, Check } from 'lucide-react';
import { RecentCandidatesProps } from '@/src/app/(pages)/company/(companyApp)/types/Application';
import { useTranslation } from "react-i18next";

export function RecentCandidates({ applications, isRestricted }: RecentCandidatesProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    if (applications.length === 0) {
        return (
            <div className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-8 text-center h-full flex flex-col items-center justify-center ${isRestricted ? 'grayscale opacity-75 pointer-events-none' : ''}`}>
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Users size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t("no_recent_candidates")}</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    {t("no_candidates_desc")}
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full ${isRestricted ? 'grayscale opacity-75 pointer-events-none' : ''}`}>
            <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                        <Users size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{t("recent_candidates")}</h3>
                </div>
            </div>

            <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="group p-4 sm:p-5 hover:bg-slate-50 transition-all duration-200 flex items-center gap-4"
                    >
                        {/* Avatar */}
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                            {app.candidatePhoto ? (
                                <img
                                    src={app.candidatePhoto}
                                    alt={app.candidateName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Users size={20} className="text-slate-400" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                                    {app.candidateName}
                                </h4>
                                <span className="text-[10px] sm:text-xs font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(app.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'pt-BR'), {
                                        day: '2-digit',
                                        month: 'short'
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 truncate">
                                    {t("applied_for")}: <span className="font-medium text-slate-700">{app.vacancyTitle}</span>
                                </p>

                                <div className="flex items-center gap-2">
                                    {app.videoStatus === 'requested' && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
                                            <Camera size={10} className="mr-1" />
                                            {t("video_requested")}
                                        </span>
                                    )}
                                    {app.videoStatus === 'submitted' && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
                                            <Check size={10} className="mr-1" />
                                            {t("video_submitted")}
                                        </span>
                                    )}
                                    {app.score !== undefined && app.score > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                                            <Star size={10} className="fill-current" />
                                            {app.score}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => startTransition(() => router.push(`/company/vacancies/${app.vacancyId}/ranking`))}
                            disabled={isPending}
                            className={`text-slate-300 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 p-3 text-center border-t border-slate-100 mt-auto">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {t("latest_applications_received")}
                </p>
            </div>
        </div>
    );
}
