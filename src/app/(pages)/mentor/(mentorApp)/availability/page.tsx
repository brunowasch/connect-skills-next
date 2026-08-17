import { MentorAvailabilityList } from "./_components/MentorAvailabilityList";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { parseSessionValue } from "@/src/lib/session";

export default async function MentorAvailabilityPage() {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: { include: { mentor_disponibilidade: true } } }
    });

    if (!user || user.tipo !== "MENTOR" || !user.mentor) {
        redirect("/");
    }

    const currentAvailability = user.mentor.mentor_disponibilidade || [];

    const entrevistas = await prisma.entrevista_mentor.findMany({
        where: { mentor_id: user.mentor.id }
    });

    const vagaIds = entrevistas.map(e => e.vaga_id).filter((id): id is string => !!id);
    const vagas = vagaIds.length > 0 ? await prisma.vaga.findMany({
        where: { id: { in: vagaIds } }
    }) : [];
    
    const empresaIds = vagas.map(v => v.empresa_id).filter(Boolean);
    const empresas = empresaIds.length > 0 ? await prisma.empresa.findMany({
        where: { id: { in: empresaIds } },
        select: { id: true, uuid: true, nome_empresa: true, foto_perfil: true }
    }) : [];

    const empresasMap = new Map(empresas.map(e => [e.id, e]));
    const vagasMap = new Map(vagas.map(v => [v.id, v]));

    const enrichedAvailability = currentAvailability.map((slot: any) => {
        const agendado = entrevistas.find(e => e.disponibilidade_id === slot.id);
        let agendamento = null;
        if (agendado) {
            const vaga = agendado.vaga_id ? vagasMap.get(agendado.vaga_id) : undefined;
            if (vaga) {
                const empresa = empresasMap.get(vaga.empresa_id);
                if (empresa) {
                    agendamento = {
                        empresaNome: empresa.nome_empresa,
                        empresaFoto: empresa.foto_perfil,
                        empresaUuid: empresa.uuid,
                        link_reuniao: agendado.link_reuniao,
                        status: agendado.status,
                    };
                }
            }
        }
        return {
            ...slot,
            agendamento
        };
    });

    const now = new Date();

    // Um slot é considerado expirado (histórico) se:
    // 1. O horário agendado já passou, OU
    // 2. O mentor encerrou a chamada após enviar o feedback (status CONCLUIDA)
    const isSlotExpired = (slot: any): boolean => {
        try {
            if (slot.agendamento?.status === 'CONCLUIDA') return true;

            const [year, month, day] = slot.data.split("-").map(Number);
            const [h, m] = slot.hora_fim.split(":").map(Number);
            const slotEnd = new Date(year, month - 1, day, h, m, 0);
            return slotEnd <= now;
        } catch {
            return false;
        }
    };

    const activeSlots = enrichedAvailability.filter((slot: any) => !isSlotExpired(slot));
    const expiredSlots = enrichedAvailability.filter((slot: any) => isSlotExpired(slot));

    return (
        <MentorAvailabilityList slots={activeSlots} expiredSlots={expiredSlots} />
    );
}
