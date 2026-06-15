import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const vagaId = searchParams.get("vagaId");

        if (!vagaId) {
            return NextResponse.json({ error: "vagaId é obrigatório." }, { status: 400 });
        }

        const vaga = await prisma.vaga.findFirst({
            where: {
                OR: [
                    { id: vagaId },
                    { uuid: vagaId }
                ]
            },
            include: {
                vaga_area: { select: { area_interesse_id: true } }
            }
        });

        if (!vaga) {
            return NextResponse.json({ mentors: [] });
        }

        const areaIds = vaga.vaga_area.map(a => a.area_interesse_id);

        if (areaIds.length === 0) {
            return NextResponse.json({ mentors: [] });
        }

        const mentorsWithAreas = await prisma.mentor_area.findMany({
            where: { area_interesse_id: { in: areaIds } },
            select: { mentor_id: true }
        });

        const mentorIds = [...new Set(mentorsWithAreas.map(m => m.mentor_id))];

        if (mentorIds.length === 0) {
            return NextResponse.json({ mentors: [] });
        }

        const now = new Date();
        const brazilDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const today = brazilDate.getFullYear() + "-"
            + String(brazilDate.getMonth() + 1).padStart(2, "0") + "-"
            + String(brazilDate.getDate()).padStart(2, "0");

        const mentors = await prisma.mentor.findMany({
            where: { id: { in: mentorIds } },
            include: {
                usuario: { select: { email: true } },
                mentor_area: {
                    include: { area_interesse: { select: { nome: true } } }
                }
            }
        });

        const activeInterviews = await (prisma as any).entrevista_mentor.findMany({
            where: {
                mentor_id: { in: mentorIds },
                status: {
                    in: ["PENDENTE_CANDIDATO", "CONFIRMADA", "CONCLUIDA"]
                }
            },
            select: { disponibilidade_id: true }
        });

        const bookedSlotIds = new Set(activeInterviews.map((i: any) => i.disponibilidade_id));


        const allSlots = await (prisma as any).mentor_disponibilidade.findMany({
            where: {
                mentor_id: { in: mentorIds }
            },
            orderBy: [
                { data: 'asc' },
                { hora_inicio: 'asc' }
            ]
        });

        const futureSlots = allSlots.filter((s: any) => s.data >= today && !bookedSlotIds.has(s.id));

        const mentorsWithSlots = mentors.map(mentor => ({
            ...mentor,
            mentor_disponibilidade: futureSlots.filter((s: any) => s.mentor_id === mentor.id)
        }));

        return NextResponse.json({ mentors: mentorsWithSlots });
    } catch (error) {
        console.error("Erro na API /api/mentor/search:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
