"use client";

import {
    MapPin, User,
    ArrowLeft, Calendar, Clock, Video
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/src/app/_components/Layout/LanguageSwitcher";

interface MentorArea {
    area_interesse: { nome: string };
}

interface MentorLink {
    id: string;
    label: string;
    url: string;
    ordem: number;
}

interface MentorArquivo {
    id: string;
    nome: string;
    url: string;
    mime: string;
    tamanho: number;
    criadoEm: string;
}

interface AvailabilitySlot {
    id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
}

interface MentorData {
    id: string;
    uuid: string | null;
    nome: string | null;
    sobrenome: string | null;
    bio: string | null;
    foto_perfil: string | null;
    pais: string | null;
    estado: string | null;
    cidade: string | null;
    mentor_area: MentorArea[];
    mentor_link: MentorLink[];
    mentor_arquivo: MentorArquivo[];
}

interface Props {
    mentor: MentorData;
    localidade: string | null;
    slots: AvailabilitySlot[];
}

const DAY_NAMES_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatDate(data: string) {
    try {
        const [year, month, day] = data.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return {
            dayName: DAY_NAMES_PT[date.getDay()],
            dayNum: String(day).padStart(2, "0"),
            monthShort: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
            full: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        };
    } catch {
        return { dayName: "", dayNum: data, monthShort: "", full: data };
    }
}

function SlotCard({ slot }: { slot: AvailabilitySlot }) {
    const { dayName, dayNum, monthShort, full } = formatDate(slot.data);

    return (
        <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
            {/* Date badge */}
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 gap-0">
                <span className="text-[10px] font-bold uppercase leading-tight tracking-wide">{monthShort}</span>
                <span className="text-2xl font-extrabold leading-none">{dayNum}</span>
                <span className="text-[10px] font-semibold text-indigo-400 leading-tight">{dayName}</span>
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{full}</p>
                <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 font-medium">
                        {slot.hora_inicio} – {slot.hora_fim}
                    </span>
                </div>
            </div>

            {/* Fixed platform badge */}
            <span className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Video size={11} /> Online · Meetor.ai
            </span>
        </div>
    );
}

export function PublicMentorProfile({ mentor, localidade, slots }: Props) {
    const { t } = useTranslation();
    const router = useRouter();
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                if (referrerUrl.host === window.location.host) {
                    setShowBackButton(true);
                }
            } catch {
                // Invalid URL
            }
        }
    }, []);

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            window.close();
        }
    };

    const handleViewFile = async (url: string, nome: string) => {
        if (!url) return;
        const lowerUrl = url.toLowerCase();
        const lowerName = nome?.toLowerCase() || "";
        const isPdf = lowerUrl.includes(".pdf") || lowerUrl.includes("/pdf") || lowerName.endsWith(".pdf");
        if (isPdf) {
            let finalUrl = url;
            if (url.includes("cloudinary.com")) {
                finalUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
            }
            window.open(`/viewer?url=${encodeURIComponent(finalUrl)}&title=${encodeURIComponent(nome)}&type=application/pdf`, "_blank");
            return;
        }
        window.open(`/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(nome)}`, "_blank");
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const fullName = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.trim() || "Mentor";

    return (
        <div className="max-w-6xl mx-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                            title={t("back_btn", "Voltar")}
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t("public_mentor_profile_title", "Perfil do Mentor")} — {fullName}
                    </h1>
                </div>
                <LanguageSwitcher align="right" />
            </div>

            {/* Main card */}
            <section className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
                {/* Accent stripe */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />

                {/* Profile header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-100 pb-8">
                    {/* Avatar */}
                    <div className="relative">
                        {mentor.foto_perfil ? (
                            <img
                                src={mentor.foto_perfil}
                                alt={fullName}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-gray-200"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md ring-1 ring-gray-200 flex items-center justify-center">
                                <User size={64} className="text-slate-400" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={16} className="text-indigo-500" />
                                        {localidade || t("location_not_informed", "Localização não informada")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <User size={14} /> {t("about_me", "Sobre mim")}
                            </h3>
                            <p className="text-gray-700 leading-relaxed italic">
                                {mentor.bio || t("no_description", "Sem descrição informada.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom sections */}
                <div className="grid grid-cols-1 gap-8 mt-8">

                    {/* Areas of expertise */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Target className="text-indigo-600" size={18} />
                                {t("areas_of_interest", "Áreas de Interesse")}
                            </h3>
                        </div>
                        {mentor.mentor_area.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {mentor.mentor_area.map((area, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                                    >
                                        {area.area_interesse.nome}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">{t("no_areas", "Nenhuma área informada.")}</p>
                        )}
                    </div>

                    {/* Availability slots */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="text-indigo-600" size={18} />
                                {t("mentor_availability_title", "Agenda de Mentorias")}
                            </h3>
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                                {slots.length} {slots.length === 1
                                    ? t("slot_singular", "horário disponível")
                                    : t("slot_plural", "horários disponíveis")}
                            </span>
                        </div>

                        {slots.length === 0 ? (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm font-medium">
                                    {t("no_upcoming_slots_public", "Este mentor não possui horários disponíveis no momento.")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {slots.map((slot) => (
                                    <SlotCard key={slot.id} slot={slot} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
}

const Target = ({ className, size }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
