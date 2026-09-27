import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { OnsiteScheduleList } from "./_components/OnsiteScheduleList";
import { isOnsiteSlotPast } from "@/src/lib/onsite-slot";

export default async function OnsiteSchedulePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

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
                    endereco_cep: true,
                    endereco_logradouro: true,
                    endereco_numero: true,
                    endereco_complemento: true,
                    endereco_bairro: true,
                    endereco_cidade: true,
                    endereco_estado: true,
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

    // Confirmadas ficam na própria aba até a empresa validar o código de presença (vira CONCLUIDA).
    const isConfirmed = (slot: any) => slot.entrevista_presencial?.status === "CONFIRMADA";

    const isHistory = (slot: any) => slot.entrevista_presencial?.status === "CONCLUIDA"
        || isOnsiteSlotPast(slot.data, slot.hora_inicio, now);

    const confirmedSlots = enrichedSlots.filter((s: any) => isConfirmed(s));
    const activeSlots = enrichedSlots.filter((s: any) => !isConfirmed(s) && !isHistory(s));
    const historySlots = enrichedSlots.filter((s: any) => !isConfirmed(s) && isHistory(s)).reverse();

    return <OnsiteScheduleList activeSlots={activeSlots} confirmedSlots={confirmedSlots} historySlots={historySlots} />;
}
