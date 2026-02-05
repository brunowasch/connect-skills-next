"use client";

import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { X } from 'lucide-react';

interface AreasListProps {
    areas: { area_interesse?: { nome?: string | null } }[];
    maxVisible?: number;
    emptyMessageKey?: string;
    defaultAreaKey?: string;
}

// Icon component since Target wasn't exported from lucide-react in the parent
const TargetIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);

export function AreasList({
    areas = [],
    maxVisible = 5,
    emptyMessageKey = "no_areas_selected",
    defaultAreaKey = "area_default"
}: AreasListProps) {
    const { t } = useTranslation();
    const [isAreasModalOpen, setIsAreasModalOpen] = useState(false);

    const safeAreas = areas || [];
    const visibleAreas = safeAreas.slice(0, maxVisible);
    const hiddenCount = safeAreas.length - maxVisible;

    if (safeAreas.length === 0) {
        return <p className="text-gray-400 text-sm italic">{t(emptyMessageKey)}</p>;
    }

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {visibleAreas.map((ca: any, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-medium">
                        {ca.area_interesse?.nome || t(defaultAreaKey)}
                    </span>
                ))}
                {hiddenCount > 0 && (
                    <button
                        onClick={() => setIsAreasModalOpen(true)}
                        className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        +{hiddenCount}
                    </button>
                )}
            </div>

            {/* Modal de Áreas */}
            {isAreasModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <TargetIcon className="text-blue-600" size={20} /> {t("areas_of_interest")}
                            </h3>
                            <button
                                onClick={() => setIsAreasModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-all cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {safeAreas.map((ca: any, idx: number) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-full text-sm font-medium">
                                        {ca.area_interesse?.nome || t(defaultAreaKey)}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-xl">
                            <button
                                onClick={() => setIsAreasModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors cursor-pointer"
                            >
                                {t("answers_modal_close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
