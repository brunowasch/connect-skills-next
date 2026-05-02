"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Globe, MapPin, Star, Clock, ChevronDown, ChevronUp, CheckCircle, Building2, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { OnsiteSlot } from "@/src/app/_components/onsite-interview/InterviewSlotCard";

interface Slot {
    id: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
}

interface Mentor {
    id: string;
    uuid: string | null;
    nome: string | null;
    sobrenome: string | null;
    bio: string | null;
    foto_perfil: string | null;
    pais: string | null;
    estado: string | null;
    cidade: string | null;
    mentor_area: { area_interesse: { nome: string } }[];
    mentor_disponibilidade: Slot[];
}

interface ScheduleInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateId: string;
    candidateName: string;
    vacancyId: string;
    vacancyTitle: string;
}

type ModalStep = "options" | "mentor_list" | "mentor_slots" | "presencial_slots" | "presencial_confirm" | "success";

export function ScheduleInterviewModal({
    isOpen,
    onClose,
    candidateId,
    candidateName,
    vacancyId,
    vacancyTitle,
}: ScheduleInterviewModalProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [step, setStep] = useState<ModalStep>("options");
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loadingMentors, setLoadingMentors] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [successType, setSuccessType] = useState<"mentor" | "presencial">("mentor");
    const [onsiteSlots, setOnsiteSlots] = useState<OnsiteSlot[]>([]);
    const [loadingOnsite, setLoadingOnsite] = useState(false);
    const [selectedOnsiteSlot, setSelectedOnsiteSlot] = useState<OnsiteSlot | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setStep("options");
            setMentors([]);
            setSelectedMentor(null);
            setExpandedMentor(null);
            setSelectedSlot(null);
            setOnsiteSlots([]);
            setSelectedOnsiteSlot(null);
        }
    }, [isOpen]);

    const fetchMentors = async () => {
        setLoadingMentors(true);
        try {
            const res = await fetch(`/api/mentor/search?vagaId=${vacancyId}`);
            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
            }
            setMentors(data.mentors || []);
        } catch {
            toast.error("Erro ao carregar mentores.");
        } finally {
            setLoadingMentors(false);
        }
    };

    const handleChooseMentor = () => {
        setStep("mentor_list");
        fetchMentors();
    };

    const fetchOnsiteSlots = async () => {
        setLoadingOnsite(true);
        try {
            const res = await fetch(`/api/company/onsite-interview/slots`);
            const data = await res.json();
            if (data.slots) {
                const available = data.slots.filter((s: OnsiteSlot) => !s.entrevista_presencial);
                setOnsiteSlots(available);
            }
        } catch {
            toast.error(t("error_connection", "Erro ao carregar horários."));
        } finally {
            setLoadingOnsite(false);
        }
    };

    const handleChoosePresencial = () => {
        setStep("presencial_slots");
        fetchOnsiteSlots();
    };

    const handleSelectMentor = (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setSelectedSlot(null);
        setStep("mentor_slots");
    };

    const handleScheduleWithMentor = async () => {
        if (!selectedMentor || !selectedSlot) return;
        setIsScheduling(true);
        try {
            const res = await fetch("/api/mentor/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vagaId: vacancyId,
                    candidatoId: candidateId,
                    mentorId: selectedMentor.id,
                    disponibilidadeId: selectedSlot.id,
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessType("mentor");
                setStep("success");
                router.refresh();
            } else {
                toast.error(data.error || "Erro ao agendar entrevista.");
            }
        } catch {
            toast.error("Erro de conexão. Tente novamente.");
        } finally {
            setIsScheduling(false);
        }
    };

    const handleSchedulePresencial = async () => {
        if (!selectedOnsiteSlot) return;
        setIsScheduling(true);
        try {
            const res = await fetch("/api/company/onsite-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vagaId: vacancyId,
                    candidatoId: candidateId,
                    slotId: selectedOnsiteSlot.id,
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessType("presencial");
                setStep("success");
                router.refresh();
            } else {
                toast.error(data.error || "Erro ao agendar entrevista presencial.");
            }
        } catch {
            toast.error(t("error_connection", "Erro de conexão. Tente novamente."));
        } finally {
            setIsScheduling(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split("-");
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {step === "options" && t("schedule_interview_title", "Agendar Entrevista")}
                                {step === "mentor_list" && t("schedule_choose_mentor", "Escolher Mentor")}
                                {step === "mentor_slots" && (selectedMentor?.nome ? `${selectedMentor.nome} ${selectedMentor.sobrenome || ""}`.trim() : "Mentor")}
                                {step === "presencial_slots" && t("onsite_choose_slot", "Escolher Horário")}
                                {step === "presencial_confirm" && t("schedule_presencial_title", "Entrevista Presencial")}
                                {step === "success" && t("schedule_success_title", "Agendamento Realizado!")}
                            </h2>
                            <p className="text-xs text-gray-500">{candidateName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {step === "options" && (
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm">
                                {t("schedule_interview_desc", "Escolha como deseja agendar a entrevista para o candidato aprovado.")}
                            </p>

                            <button
                                onClick={handleChooseMentor}
                                className="w-full flex items-start gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl transition-all cursor-pointer group text-left"
                            >
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-indigo-900 text-base">
                                        {t("schedule_with_platform_mentor", "Agendar com Mentor da Plataforma")}
                                    </p>
                                    <p className="text-sm text-indigo-600 mt-1">
                                        {t("schedule_mentor_desc", "Conecte o candidato a um mentor especializado nas áreas da vaga. O mentor conduzirá a entrevista técnica.")}
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={handleChoosePresencial}
                                className="w-full flex items-start gap-4 p-5 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 rounded-2xl transition-all cursor-pointer group text-left"
                            >
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-orange-900 text-base">
                                        {t("schedule_presencial", "Agendar Entrevista Presencial")}
                                    </p>
                                    <p className="text-sm text-orange-600 mt-1">
                                        {t("schedule_presencial_desc_new", "Escolha um dos horários publicados na agenda de entrevistas presenciais e convoque o candidato.")}
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}
                    {step === "mentor_list" && (
                        <div className="p-6">
                            {loadingMentors ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                    <p className="text-gray-500 text-sm">{t("schedule_loading_mentors", "Buscando mentores disponíveis...")}</p>
                                </div>
                            ) : mentors.length === 0 ? (
                                <div className="text-center py-16">
                                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">{t("schedule_no_mentors", "Nenhum mentor disponível para as áreas desta vaga.")}</p>
                                    <p className="text-gray-400 text-sm mt-1">{t("schedule_no_mentors_hint", "Verifique se há mentores com horários futuros cadastrados.")}</p>
                                    <button
                                        onClick={() => setStep("options")}
                                        className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:underline cursor-pointer"
                                    >
                                        ← {t("back_btn", "Voltar")}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 mb-2">
                                        {mentors.length} {t("schedule_mentors_found", "mentor(es) encontrado(s) para as áreas da vaga")}
                                    </p>
                                    {mentors.map((mentor) => {
                                        const name = `${mentor.nome || ""} ${mentor.sobrenome || ""}`.trim();
                                        const location = [mentor.cidade, mentor.estado, mentor.pais].filter(Boolean).join(", ");
                                        const isExpanded = expandedMentor === mentor.id;

                                        return (
                                            <div
                                                key={mentor.id}
                                                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-colors"
                                            >
                                                <div className="flex items-start gap-4 p-4">
                                                    {mentor.uuid ? (
                                                        <a
                                                            href={`/viewer/mentor/${mentor.uuid}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Ver perfil do mentor"
                                                            className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-indigo-200 hover:border-indigo-400 hover:scale-105 transition-all cursor-pointer"
                                                        >
                                                            {mentor.foto_perfil ? (
                                                                <img src={mentor.foto_perfil} alt={name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-7 h-7 text-indigo-400" />
                                                            )}
                                                        </a>
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-indigo-200">
                                                            {mentor.foto_perfil ? (
                                                                <img src={mentor.foto_perfil} alt={name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-7 h-7 text-indigo-400" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900">{name}</h3>
                                                        {location && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                                <MapPin className="w-3 h-3" />
                                                                {location}
                                                            </div>
                                                        )}
                                                        {mentor.bio && (
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mentor.bio}</p>
                                                        )}
                                                        {mentor.mentor_area.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {mentor.mentor_area.slice(0, 3).map((a, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                                                                        {a.area_interesse.nome}
                                                                    </span>
                                                                ))}
                                                                {mentor.mentor_area.length > 3 && (
                                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                                                        +{mentor.mentor_area.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        {mentor.mentor_disponibilidade.length > 0 ? (
                                                            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                {mentor.mentor_disponibilidade.length} {t("schedule_slots", "horários")}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                                Sem horários futuros
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => setExpandedMentor(isExpanded ? null : mentor.id)}
                                                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t border-gray-100 px-4 pb-4">
                                                        {mentor.mentor_disponibilidade.length > 0 ? (
                                                            <>
                                                                <p className="text-xs text-gray-400 mb-2 mt-3 font-medium uppercase tracking-wide">Próximos horários disponíveis</p>
                                                                <div className="grid grid-cols-2 gap-2 mb-3">
                                                                    {mentor.mentor_disponibilidade.slice(0, 4).map((slot) => (
                                                                        <div key={slot.id} className="text-xs bg-gray-50 rounded-lg p-2 border border-gray-100">
                                                                            <p className="font-semibold text-gray-700">{formatDate(slot.data)}</p>
                                                                            <p className="text-gray-500">{slot.hora_inicio} – {slot.hora_fim}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleSelectMentor(mentor)}
                                                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                                                                >
                                                                    {t("schedule_select_mentor", "Selecionar este Mentor")}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs text-amber-600 mt-3 mb-1">Este mentor não possui horários futuros cadastrados.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {!isExpanded && mentor.mentor_disponibilidade.length > 0 && (
                                                    <div className="border-t border-gray-100 px-4 pb-3">
                                                        <button
                                                            onClick={() => handleSelectMentor(mentor)}
                                                            className="mt-2 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                                                        >
                                                            {t("schedule_select_mentor", "Selecionar este Mentor")}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Mentor Slots */}
                    {step === "mentor_slots" && selectedMentor && (
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {selectedMentor.foto_perfil ? (
                                        <img src={selectedMentor.foto_perfil} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-indigo-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-indigo-900 text-sm">{`${selectedMentor.nome || ""} ${selectedMentor.sobrenome || ""}`.trim()}</p>
                                    <p className="text-xs text-indigo-500">{selectedMentor.mentor_area.map(a => a.area_interesse.nome).join(", ")}</p>
                                </div>
                            </div>

                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                {t("schedule_choose_slot", "Selecione um horário disponível:")}
                            </p>

                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {selectedMentor.mentor_disponibilidade.map((slot) => {
                                    const isSelected = selectedSlot?.id === slot.id;
                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left
                                                ${isSelected
                                                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                                    : "border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}>
                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-semibold text-gray-800 text-sm">{formatDate(slot.data)}</span>
                                                    <span className="text-xs text-gray-400">{slot.data.split("-").reverse().join("/")}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{slot.hora_inicio} – {slot.hora_fim}</span>
                                                </div>
                                            </div>
                                            {isSelected && <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                                {t("schedule_slot_privacy", "O horário selecionado não será visível para outros candidatos ou para o mentor até o candidato confirmar a presença.")}
                            </div>
                        </div>
                    )}
                    {step === "presencial_slots" && (
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{t("onsite_available_slots_title", "Horários Disponíveis da Empresa")}</p>
                                    <p className="text-xs text-gray-500">{t("onsite_available_slots_desc", "Escolha um dos horários que você cadastrou para esta vaga.")}</p>
                                </div>
                            </div>

                            {loadingOnsite ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                                </div>
                            ) : onsiteSlots.length === 0 ? (
                                <div className="text-center py-12 bg-orange-50 rounded-xl border border-dashed border-orange-200">
                                    <Calendar className="w-10 h-10 text-orange-300 mx-auto mb-3" />
                                    <p className="text-gray-600 text-sm font-medium">{t("onsite_no_available_slots", "Nenhum horário disponível.")}</p>
                                    <p className="text-gray-400 text-xs mt-1 max-w-[260px] mx-auto">
                                        {t("onsite_add_slots_hint_modal", "Publique horários na página de Entrevistas Presenciais para poder convocar candidatos.")}
                                    </p>
                                    <a
                                        href="/company/onsite-schedule"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors"
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        {t("onsite_go_to_schedule", "Publicar Horários")}
                                    </a>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">
                                        {t("schedule_choose_slot", "Selecione um horário disponível:")}
                                    </p>
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {onsiteSlots.map((slot) => {
                                            const isSelected = selectedOnsiteSlot?.id === slot.id;
                                            return (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedOnsiteSlot(slot)}
                                                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left
                                                        ${isSelected
                                                            ? "border-gray-800 bg-gray-50 shadow-sm"
                                                            : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                        ${isSelected ? "border-gray-800 bg-gray-800" : "border-gray-300"}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="font-semibold text-gray-800 text-sm">{formatDate(slot.data)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-sm text-gray-600">{slot.hora_inicio}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && <CheckCircle className="w-5 h-5 text-gray-800 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === "presencial_confirm" && (
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                    <Building2 className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{t("schedule_presencial_title", "Entrevista Presencial")}</h3>
                                <p className="text-gray-500 text-sm max-w-xs">
                                    {t("onsite_confirm_dispatch_desc", "O candidato receberá um convite para confirmar a presença nesta data e horário.")}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t("candidate", "Candidato")}</p>
                                        <p className="text-gray-900 font-bold text-sm truncate">{candidateName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t("vacancy", "Vaga")}</p>
                                        <p className="text-gray-900 font-bold text-sm truncate">{vacancyTitle}</p>
                                    </div>
                                </div>
                                {selectedOnsiteSlot && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t("onsite_selected_slot", "Horário Selecionado")}</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedOnsiteSlot.data)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-800 text-sm">{selectedOnsiteSlot.hora_inicio}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {step === "success" && (
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {successType === "mentor"
                                    ? t("schedule_success_mentor", "Entrevista Agendada com Sucesso!")
                                    : t("schedule_success_presencial", "Candidato Convocado com Sucesso!")}
                            </h3>
                            <p className="text-gray-500 text-sm max-w-xs">
                                {successType === "mentor"
                                    ? t("schedule_success_mentor_desc", "O candidato receberá um e-mail e uma notificação na plataforma para confirmar a presença. O mentor será notificado somente após a confirmação.")
                                    : t("schedule_success_presencial_desc", "O candidato foi marcado como convocado para entrevista presencial.")}
                            </p>
                            {successType === "mentor" && selectedMentor && selectedSlot && (
                                <div className="mt-4 bg-gray-50 rounded-xl p-4 w-full text-left border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-semibold text-gray-700">{`${selectedMentor.nome || ""} ${selectedMentor.sobrenome || ""}`.trim()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{formatDate(selectedSlot.data)} · {selectedSlot.hora_inicio}–{selectedSlot.hora_fim}</span>
                                    </div>
                                </div>
                            )}
                            {successType === "presencial" && selectedOnsiteSlot && (
                                <div className="mt-4 bg-gray-50 rounded-xl p-4 w-full text-left border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-semibold text-gray-700">{t("schedule_presencial_title", "Entrevista Presencial")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{formatDate(selectedOnsiteSlot.data)} · {selectedOnsiteSlot.hora_inicio}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    {step !== "success" && step !== "options" && (
                        <button
                            onClick={() => {
                                if (step === "mentor_list") setStep("options");
                                else if (step === "mentor_slots") setStep("mentor_list");
                                else if (step === "presencial_slots") setStep("options");
                                else if (step === "presencial_confirm") setStep("presencial_slots");
                            }}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            ← {t("back_btn", "Voltar")}
                        </button>
                    )}

                    {step === "options" && (
                        <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                            {t("cancel", "Cancelar")}
                        </button>
                    )}

                    {step === "mentor_slots" && (
                        <button
                            onClick={handleScheduleWithMentor}
                            disabled={!selectedSlot || isScheduling}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-xl font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isScheduling ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t("schedule_scheduling", "Agendando...")}
                                </>
                            ) : (
                                t("schedule_confirm_btn", "Confirmar Agendamento")
                            )}
                        </button>
                    )}

                    {step === "presencial_slots" && (
                        <button
                            onClick={() => setStep("presencial_confirm")}
                            disabled={!selectedOnsiteSlot}
                            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                            {t("continue_btn", "Continuar")}
                        </button>
                    )}

                    {step === "presencial_confirm" && (
                        <button
                            onClick={handleSchedulePresencial}
                            disabled={isScheduling}
                            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isScheduling ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t("schedule_scheduling", "Agendando...")}
                                </>
                            ) : (
                                t("schedule_confirm_btn", "Confirmar Agendamento")
                            )}
                        </button>
                    )}

                    {step === "success" && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors cursor-pointer"
                        >
                            {t("close", "Fechar")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
