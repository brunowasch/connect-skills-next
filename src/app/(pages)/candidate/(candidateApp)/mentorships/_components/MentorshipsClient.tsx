"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Clock, Video, User, Star, X, AlertTriangle, CheckCircle, GraduationCap, Sparkles, Briefcase, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AvailabilitySlot {
    id: string;
    mentor_id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
}

interface MentorArea {
    mentor_id: string;
    area_interesse_id: number;
}

interface Mentor {
    id: string;
    nome: string | null;
    sobrenome: string | null;
    bio: string | null;
    foto_perfil: string | null;
    cidade: string | null;
    estado: string | null;
    pais: string | null;
    areas: string[];
    mentor_area?: MentorArea[];
    mentor_disponibilidade: AvailabilitySlot[];
}

interface Area {
    id: number;
    nome: string | null;
    padrao: boolean | null;
    uuid: string | null;
}

interface BookedMentorship {
    id: string;
    vaga_id: string | null;
    status: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    link_reuniao: string | null;
    mentor: {
        id: string;
        nome: string | null;
        sobrenome: string | null;
        foto_perfil: string | null;
        bio: string | null;
    } | null;
}

interface MentorshipsClientProps {
    mentors: Mentor[];
    candidateAreas: string[];
    candidateAreaIds: number[];
    allAreas: Area[];
    myMentorships?: BookedMentorship[];
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

export function MentorshipsClient({ mentors, candidateAreas, candidateAreaIds, allAreas, myMentorships = [] }: MentorshipsClientProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"recommended" | "all" | "upcoming" | "history">("recommended");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAreaId, setSelectedAreaId] = useState<string>("all");
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    // Process mentorship bookings (upcoming vs history)
    const processedBookings = myMentorships.map(m => {
        let isPast = false;
        if (m.status === 'CONCLUIDA' || m.status === 'CANCELADA' || m.status === 'RECUSADA') {
            isPast = true;
        } else if (m.data) {
            const [year, month, day] = m.data.split("-");
            const timeToUse = m.hora_fim || m.hora_inicio;
            if (timeToUse && year && month && day) {
                const [h, min] = timeToUse.split(":");
                if (h && min) {
                    const endData = new Date(Number(year), Number(month) - 1, Number(day), Number(h), Number(min), 0);
                    if (Date.now() > endData.getTime()) {
                        isPast = true;
                    }
                }
            }
        }
        return { ...m, isPast };
    });

    const upcomingBookings = processedBookings.filter(m => !m.isPast);
    const historyBookings = processedBookings.filter(m => m.isPast);


    // Filter mentors based on active tab, search query, and selected area
    const filteredMentors = mentors.filter(mentor => {
        // 1. Tab filter
        if (activeTab === "recommended") {
            const hasCommonArea = mentor.mentor_area?.some((ma: any) =>
                candidateAreaIds.includes(ma.area_interesse_id)
            );
            if (!hasCommonArea) return false;
        }

        // 2. Search query filter (name, bio, areas)
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const fullName = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.toLowerCase();
            const bio = (mentor.bio || "").toLowerCase();
            const matchesNameOrBio = fullName.includes(query) || bio.includes(query);
            const matchesAreas = mentor.areas.some(area => area.toLowerCase().includes(query));

            if (!matchesNameOrBio && !matchesAreas) return false;
        }

        // 3. Dropdown area filter
        if (selectedAreaId !== "all") {
            const matchesSelectedArea = mentor.mentor_area?.some((ma: any) =>
                String(ma.area_interesse_id) === selectedAreaId
            );
            if (!matchesSelectedArea) return false;
        }

        return true;
    });

    const handleOpenSchedule = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setSelectedSlot(null);
    };

    const handleCloseSchedule = () => {
        if (!isBooking) {
            setSelectedMentor(null);
            setSelectedSlot(null);
        }
    };

    const handleSelectSlot = (slot: AvailabilitySlot) => {
        setSelectedSlot(slot);
    };

    const handleConfirmBooking = async () => {
        if (!selectedMentor || !selectedSlot) return;

        setIsBooking(true);
        try {
            const response = await fetch("/api/candidate/mentorships/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId: selectedMentor.id,
                    disponibilidadeId: selectedSlot.id
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Mentoria agendada com sucesso!");
                setSelectedMentor(null);
                setSelectedSlot(null);
                setActiveTab("upcoming");
                router.refresh();
            } else {
                toast.error(data.error || "Ocorreu um erro ao agendar a mentoria.");
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Erro de conexão ao tentar agendar mentoria.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("sidebar_mentorings", "Mentorias")}
                </h1>
                <p className="text-gray-500">
                    Encontre mentores experientes em diversas áreas de atuação, tire dúvidas e impulsione sua carreira profissional agendando sessões individuais.
                </p>
            </div>

            {/* Tabs */}
            <div className="relative mb-4 sm:mb-8 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide w-full">
                    <button
                        onClick={() => {
                            setActiveTab("recommended");
                            setSelectedAreaId("all");
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 active:bg-gray-50 cursor-pointer ${
                            activeTab === "recommended"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        Recomendados
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("all");
                            setSelectedAreaId("all");
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 active:bg-gray-50 cursor-pointer ${
                            activeTab === "all"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <Briefcase className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        Explorar Todos
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("upcoming");
                            setSelectedAreaId("all");
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 active:bg-gray-50 cursor-pointer ${
                            activeTab === "upcoming"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <Calendar className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        Próximas
                        {upcomingBookings.length > 0 && (
                            <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${
                                activeTab === "upcoming" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                            }`}>
                                {upcomingBookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("history");
                            setSelectedAreaId("all");
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 active:bg-gray-50 cursor-pointer ${
                            activeTab === "history"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <History className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        Histórico
                        {historyBookings.length > 0 && (
                            <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${
                                activeTab === "history" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                            }`}>
                                {historyBookings.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                    <h2 className="text-sm sm:text-lg font-bold text-gray-900">
                        {activeTab === "recommended" ? "Mentores Recomendados" :
                         activeTab === "all" ? "Todos os Mentores" :
                         activeTab === "upcoming" ? "Próximas Mentorias" :
                         "Seu Histórico"}
                    </h2>
                    {/* Meta indicator */}
                    <span className="bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full">
                        {activeTab === "upcoming" || activeTab === "history"
                            ? `${activeTab === "upcoming" ? upcomingBookings.length : historyBookings.length} agendamentos encontrados`
                            : `${filteredMentors.length} mentores encontrados`}
                    </span>
                </div>


                {/* Filters Row */}
                {activeTab !== "upcoming" && activeTab !== "history" && (
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Text Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nome do mentor ou palavra-chave..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full rounded-xl border border-slate-200 p-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50"
                            />
                        </div>

                        {/* Area Select */}
                        <div className="w-full md:w-64">
                            <select
                                value={selectedAreaId}
                                onChange={(e) => setSelectedAreaId(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 cursor-pointer font-medium"
                            >
                                <option value="all">Filtrar por Área (Todas)</option>
                                {allAreas.map(area => (
                                    <option key={area.id} value={String(area.id)}>
                                        {area.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Mentors Grid / Bookings */}
            {activeTab === "upcoming" || activeTab === "history" ? (
                <div className="space-y-6">
                    {/* Bookings List */}
                    {activeTab === "upcoming" && upcomingBookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-full">
                            <GraduationCap className="mx-auto h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                            <h3 className="text-lg font-bold text-slate-800">Nenhuma mentoria próxima</h3>
                            <p className="text-slate-500 mt-1.5 max-w-sm mx-auto text-sm">
                                Você não possui nenhuma sessão de mentoria agendada para os próximos dias.
                            </p>
                        </div>
                    ) : activeTab === "history" && historyBookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-full">
                            <History className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-bold text-slate-800">Seu histórico está vazio</h3>
                            <p className="text-slate-500 mt-1.5 max-w-sm mx-auto text-sm">
                                Você ainda não possui mentorias concluídas ou passadas em seu histórico.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(activeTab === "upcoming" ? upcomingBookings : historyBookings).map((session: any) => {
                                const mentorName = session.mentor
                                    ? `${session.mentor.nome || ""} ${session.mentor.sobrenome || ""}`.trim()
                                    : "Mentor";
                                const [year, month, day] = session.data.split("-");
                                const formattedDate = `${day}/${month}/${year}`;
                                const isPast = session.isPast;

                                return (
                                    <div
                                        key={session.id}
                                        className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col h-full overflow-hidden ${
                                            isPast ? 'border-slate-200 opacity-80' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="p-5 flex-grow space-y-4">
                                            <div className="flex gap-4 items-start">
                                                <div className={`relative w-14 h-14 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 shadow-sm ${isPast ? 'grayscale' : ''}`}>
                                                    {session.mentor?.foto_perfil ? (
                                                        <img
                                                            src={session.mentor.foto_perfil}
                                                            alt={mentorName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                                                            <User size={24} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-base text-slate-900 truncate">
                                                        {mentorName}
                                                    </h3>
                                                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                                                        session.status === 'CONFIRMADA' && !isPast ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        session.status === 'CONCLUIDA' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        session.status === 'PENDENTE_CANDIDATO' && !isPast ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                        session.status === 'CANCELADA' || session.status === 'RECUSADA' || isPast ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                                                        'bg-slate-50 text-slate-600 border border-slate-200'
                                                    }`}>
                                                        {session.status === 'CONFIRMADA' && isPast ? 'EXPIRADA' : session.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 min-h-[50px] italic">
                                                {session.mentor?.bio || "Nenhuma biografia fornecida por este mentor."}
                                            </p>

                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="font-medium">{formattedDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <span className="font-medium">{session.hora_inicio} – {session.hora_fim}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                            <button
                                                onClick={() => router.push(`/viewer/mentorship/${session.id}`)}
                                                className="flex-1 py-2 px-3 text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition duration-150 cursor-pointer text-center"
                                            >
                                                Ver Detalhes
                                            </button>
                                            {!isPast && session.status === 'CONFIRMADA' && session.link_reuniao && (
                                                <a
                                                    href={session.link_reuniao.replace(/"/g, "")}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-2 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-150 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Video size={13} />
                                                    Entrar na Reunião
                                                </a>
                                            )}
                                            {!isPast && session.status === 'PENDENTE_CANDIDATO' && (
                                                <button
                                                    onClick={() => router.push(`/candidate/interviews/${session.id}/confirm`)}
                                                    className="flex-1 py-2 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition duration-150 cursor-pointer text-center"
                                                >
                                                    Confirmar Presença
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            ) : filteredMentors.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-full">
                    <User className="mx-auto h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                    <h3 className="text-lg font-bold text-slate-800">Nenhum mentor encontrado</h3>
                    <p className="text-slate-500 mt-1.5 max-w-sm mx-auto text-sm">
                        {activeTab === "recommended"
                            ? "Não há mentores com perfis nas suas áreas de interesse configuradas. Adicione mais áreas no seu perfil ou vá para a aba 'Explorar Todos'."
                            : "Tente reajustar seus filtros de pesquisa ou área para localizar profissionais cadastrados."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredMentors.map(mentor => {
                        const fullName = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.trim() || "Mentor";
                        const location = mentor.cidade && mentor.estado
                            ? `${mentor.cidade}, ${mentor.estado}`
                            : mentor.cidade || mentor.estado || mentor.pais || null;
                        const visibleAreas = mentor.areas.slice(0, 2);
                        const extraAreas = mentor.areas.length - visibleAreas.length;

                        return (
                            <div
                                key={mentor.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col overflow-hidden"
                            >
                                <div className="p-6 flex-grow flex flex-col gap-4">
                                    {/* Avatar + Name */}
                                    <div className="flex flex-col gap-3">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shadow flex-shrink-0 bg-slate-100">
                                            {mentor.foto_perfil ? (
                                                <img
                                                    src={mentor.foto_perfil}
                                                    alt={fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400">
                                                    <User size={28} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[17px] text-slate-900 leading-tight">
                                                {fullName}
                                            </h3>
                                            {mentor.areas.length > 0 && (
                                                <p className="text-slate-500 text-sm mt-0.5">
                                                    {mentor.areas[0]}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                                        {mentor.bio || "Nenhuma biografia fornecida por este mentor."}
                                    </p>

                                    {/* Location */}
                                    {location && (
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                                            <span>{location}</span>
                                        </div>
                                    )}

                                    {/* Areas of expertise */}
                                    {mentor.areas.length > 0 && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Áreas de atuação</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {visibleAreas.map((area, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200"
                                                    >
                                                        {area}
                                                    </span>
                                                ))}
                                                {extraAreas > 0 && (
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-md border border-slate-200">
                                                        +{extraAreas} mais
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Availability */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Disponibilidade</p>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-slate-400" />
                                            <span className="text-sm text-slate-600 font-medium">
                                                {mentor.mentor_disponibilidade.length === 0
                                                    ? "Sem horários disponíveis"
                                                    : mentor.mentor_disponibilidade.length === 1
                                                    ? "1 horário livre"
                                                    : `${mentor.mentor_disponibilidade.length} horários livres`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <div className="px-6 pb-6 pt-2">
                                    <button
                                        onClick={() => handleOpenSchedule(mentor)}
                                        disabled={mentor.mentor_disponibilidade.length === 0}
                                        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {mentor.mentor_disponibilidade.length === 0 ? "Indisponível" : "Ver Perfil e Agendar"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Schedule Booking Modal */}
            {selectedMentor && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn"
                    onClick={handleCloseSchedule}
                >
                    <div
                        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl relative flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleCloseSchedule}
                            disabled={isBooking}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>

                        {/* Mentor header info */}
                        <div className="flex gap-4 items-center border-b border-slate-100 pb-5">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shadow-sm flex-shrink-0">
                                {selectedMentor.foto_perfil ? (
                                    <img
                                        src={selectedMentor.foto_perfil}
                                        alt={selectedMentor.nome || ""}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                                        <User size={28} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                                    Agendar Mentoria
                                </h3>
                                <p className="text-slate-500 text-sm mt-0.5 font-medium">
                                    com {selectedMentor.nome} {selectedMentor.sobrenome}
                                </p>
                            </div>
                        </div>

                        {/* Slots area */}
                        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Horários Disponíveis
                            </h4>

                            {selectedMentor.mentor_disponibilidade.length === 0 ? (
                                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                    <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm font-semibold">
                                        Sem horários disponíveis
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Este mentor não possui horários cadastrados na agenda no momento.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedMentor.mentor_disponibilidade.map((slot) => {
                                        const { dayName, dayNum, monthShort, full } = formatDate(slot.data);
                                        const isSelected = selectedSlot?.id === slot.id;

                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={isBooking}
                                                onClick={() => handleSelectSlot(slot)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-blue-50 border-blue-400 ring-2 ring-blue-100"
                                                        : "bg-white border-slate-200 hover:border-blue-300"
                                                }`}
                                            >
                                                {/* Date badge */}
                                                <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-center gap-0 ${
                                                    isSelected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 border border-slate-100"
                                                }`}>
                                                    <span className="text-[8px] font-bold uppercase leading-none">{monthShort}</span>
                                                    <span className="text-lg font-black leading-none mt-0.5">{dayNum}</span>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-xs truncate">{full}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Clock size={11} className="text-slate-400" />
                                                        <span className="text-[11px] text-slate-500 font-medium">
                                                            {slot.hora_inicio} – {slot.hora_fim}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Confirmation panel */}
                        <div className="border-t border-slate-100 pt-4 mt-auto flex flex-col gap-3">
                            {selectedSlot && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5">
                                    <Video className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-blue-800 font-medium leading-relaxed">
                                        A reunião acontecerá de forma online. O link da chamada de vídeo no <strong>Jitsi</strong> será gerado e anexado ao seu agendamento imediatamente.
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseSchedule}
                                    disabled={isBooking}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isBooking || !selectedSlot}
                                    className={`flex-1 py-3 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 ${
                                        selectedSlot && !isBooking
                                            ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 cursor-pointer"
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-100"
                                    }`}
                                >
                                    {isBooking ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Reservando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={15} />
                                            Confirmar Agendamento
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
