import { CheckCircle, X, ArrowRight, List, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VacancySuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    vacancyUuid?: string;
}

export function VacancySuccessModal({ isOpen, onClose, mode, vacancyUuid }: VacancySuccessModalProps) {
    const { t } = useTranslation();
    const router = useRouter();

    if (!isOpen) return null;

    const handleView = () => {
        if (vacancyUuid) {
            router.push(`/company/vacancies/${vacancyUuid}`);
        }
    };

    const handleList = () => {
        router.push("/company/vacancies");
    };

    const handleCreateNew = () => {
        location.reload();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'create' ? t('vacancy_published_title') : t('vacancy_updated_title')}
                    </h2>

                    <p className="text-gray-600">
                        {mode === 'create' ? t('vacancy_published_desc') : t('vacancy_updated_desc')}
                    </p>

                    <div className="w-full space-y-3 pt-4">
                        <button
                            onClick={handleView}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {t('view_vacancy_btn')} <ArrowRight size={18} />
                        </button>

                        <button
                            onClick={handleList}
                            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                            <List size={18} /> {t('back_to_vacancies_btn')}
                        </button>

                        {mode === 'create' && (
                            <button
                                onClick={handleCreateNew}
                                className="w-full py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> {t('create_another_btn')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
