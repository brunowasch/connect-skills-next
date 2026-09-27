import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { OnsiteScheduleList } from "./_components/OnsiteScheduleList";
import { parseSessionValue } from "@/src/lib/session";

export default async function OnsiteSchedulePage() {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) {
        redirect("/login");
    }

    const empresa = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
    });

    if (!empresa) {
        redirect("/company/dashboard");
    }

    const slots = await (prisma as any).entrevista_presencial_slot.findMany({
        where: { empresa_id: empresa.id },
        include: {
            entrevista_presencial: {
                select: {
                    id: true,
                    status: true,
                    candidato_id: true,
                    vaga_id: true,
                    candidato_compareceu: true,
                }
            }
        },
        orderBy: [{ data: "asc" }, { hora_inicio: "asc" }],
    });

    const candidatoIds = slots
        .map((s: any) => s.entrevista_presencial?.candidato_id)
        .filter(Boolean) as string[];

    const candidatos = candidatoIds.length > 0
        ? await prisma.candidato.findMany({
            where: { id: { in: candidatoIds } },
            select: { id: true, nome: true, sobrenome: true, foto_perfil: true, uuid: true, usuario: { select: { avatarUrl: true } } }
        })
        : [];

    const vagaIds = slots
        .map((s: any) => s.entrevista_presencial?.vaga_id)
        .filter(Boolean) as string[];

    const vagas = vagaIds.length > 0
        ? await prisma.vaga.findMany({
            where: { id: { in: vagaIds } },
            select: { id: true, cargo: true }
        })
        : [];

    const candidatosMap = new Map(candidatos.map(c => [c.id, c]));
    const vagasMap = new Map(vagas.map(v => [v.id, v]));

    const now = new Date();

    const enrichedSlots = slots.map((slot: any) => {
        const candidato = slot.entrevista_presencial?.candidato_id
            ? candidatosMap.get(slot.entrevista_presencial.candidato_id) ?? null
            : null;
        const vaga = slot.entrevista_presencial?.vaga_id
            ? vagasMap.get(slot.entrevista_presencial.vaga_id) ?? null
            : null;

        return {
            ...slot,
            candidato,
            vagaTitle: vaga?.cargo ?? null,
        };
    });

    const isExpired = (slot: typeof enrichedSlots[number]): boolean => {
        try {
            if (slot.entrevista_presencial?.status === "CONFIRMADA") return true;
            const [year, month, day] = slot.data.split("-").map(Number);
            const [h, m] = slot.hora_inicio.split(":").map(Number);
            const slotEnd = new Date(year, month - 1, day, h, m, 0);
            return slotEnd <= now;
        } catch {
            return false;
        }
    };

    const activeSlots = enrichedSlots.filter((s: any) => !isExpired(s));
    const historySlots = enrichedSlots.filter((s: any) => isExpired(s));

    return <OnsiteScheduleList activeSlots={activeSlots} historySlots={historySlots} />;
}
