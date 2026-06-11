import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { mentor: true }
        });

        if (!user || user.tipo !== "MENTOR" || !user.mentor) {
            return NextResponse.json({ error: "Mentor não encontrado." }, { status: 404 });
        }

        const { id } = await params;

        const slot = await prisma.mentor_disponibilidade.findUnique({
            where: { id }
        });

        if (!slot || slot.mentor_id !== user.mentor.id) {
            return NextResponse.json({ error: "Horário não encontrado ou não pertence a você." }, { status: 404 });
        }

        await prisma.mentor_disponibilidade.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Horário removido com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar disponibilidade:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}

function getSlotRange(dateStr: string, startStr: string, endStr: string): { start: Date, end: Date } {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);
    
    const start = new Date(year, month - 1, day, startH, startM, 0, 0);
    const end = new Date(year, month - 1, day, endH, endM, 0, 0);
    
    if (end <= start) {
        end.setDate(end.getDate() + 1);
    }
    return { start, end };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { mentor: true }
        });

        if (!user || user.tipo !== "MENTOR" || !user.mentor) {
            return NextResponse.json({ error: "Mentor não encontrado." }, { status: 404 });
        }

        const { id } = await params;
        const body = await req.json();
        const { data: slotData, hora_inicio, hora_fim } = body;

        const slot = await prisma.mentor_disponibilidade.findUnique({
            where: { id }
        });

        if (!slot || slot.mentor_id !== user.mentor.id) {
            return NextResponse.json({ error: "Horário não encontrado ou não pertence a você." }, { status: 404 });
        }

        if (!slotData || !hora_inicio || !hora_fim) {
            return NextResponse.json({ error: "Data, hora de início e término são obrigatórias." }, { status: 400 });
        }

        const { start, end } = getSlotRange(slotData, hora_inicio, hora_fim);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins !== 45) {
            return NextResponse.json({ error: "O horário deve ter exatamente 45 minutos de duração." }, { status: 400 });
        }

        // Check overlaps with other slots in DB
        const dbSlots = await prisma.mentor_disponibilidade.findMany({
            where: {
                mentor_id: user.mentor.id,
                id: { not: id }
            }
        });

        for (const dbSlot of dbSlots) {
            const dbRange = getSlotRange(dbSlot.data, dbSlot.hora_inicio, dbSlot.hora_fim);
            if (start < dbRange.end && dbRange.start < end) {
                const [year, month, day] = slotData.split("-");
                const formattedDate = `${day}/${month}/${year}`;
                return NextResponse.json({ 
                    error: `O horário ${hora_inicio}–${hora_fim} no dia ${formattedDate} conflita com uma disponibilidade existente (${dbSlot.hora_inicio}–${dbSlot.hora_fim}).` 
                }, { status: 400 });
            }
        }

        await prisma.mentor_disponibilidade.update({
            where: { id },
            data: {
                data: slotData,
                hora_inicio,
                hora_fim
            }
        });

        return NextResponse.json({ id, data: slotData, hora_inicio, hora_fim });

    } catch (error) {
        console.error("Erro ao atualizar disponibilidade:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
