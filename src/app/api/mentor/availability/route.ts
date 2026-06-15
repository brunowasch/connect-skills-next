import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slots, usuario_id } = body;

        if (!slots || !Array.isArray(slots) || !usuario_id) {
            return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            include: { mentor: true }
        });

        if (!user || user.tipo !== "MENTOR" || !user.mentor) {
            return NextResponse.json({ error: "Mentor não encontrado." }, { status: 404 });
        }

        const mentorId = user.mentor.id;

        // 1. Validate duration and self-overlaps of input slots
        const parsedInputSlots: { start: Date; end: Date; slot: any }[] = [];
        for (const slot of slots) {
            if (!slot.data || !slot.hora_inicio || !slot.hora_fim) {
                return NextResponse.json({ error: "Data, hora de início e hora de término são obrigatórias para todos os horários." }, { status: 400 });
            }

            const { start, end } = getSlotRange(slot.data, slot.hora_inicio, slot.hora_fim);
            const diffMs = end.getTime() - start.getTime();
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins !== 45) {
                return NextResponse.json({ 
                    error: `O horário das ${slot.hora_inicio} às ${slot.hora_fim} no dia ${slot.data} não possui a duração obrigatória de 45 minutos.` 
                }, { status: 400 });
            }

            for (const existing of parsedInputSlots) {
                if (start < existing.end && existing.start < end) {
                    return NextResponse.json({ 
                        error: `Conflito interno detectado: o horário ${slot.hora_inicio}–${slot.hora_fim} se sobrepõe ao horário ${existing.slot.hora_inicio}–${existing.slot.hora_fim} no dia ${slot.data}.` 
                    }, { status: 400 });
                }
            }

            parsedInputSlots.push({ start, end, slot });
        }

        // 2. Fetch existing slots in database to check overlaps
        const dbSlots = await prisma.mentor_disponibilidade.findMany({
            where: { mentor_id: mentorId }
        });

        // 3. Check overlaps against database slots
        for (const input of parsedInputSlots) {
            for (const dbSlot of dbSlots) {
                const dbRange = getSlotRange(dbSlot.data, dbSlot.hora_inicio, dbSlot.hora_fim);
                if (input.start < dbRange.end && dbRange.start < input.end) {
                    const [year, month, day] = input.slot.data.split("-");
                    const formattedDate = `${day}/${month}/${year}`;
                    return NextResponse.json({ 
                        error: `O horário ${input.slot.hora_inicio}–${input.slot.hora_fim} no dia ${formattedDate} conflita com uma disponibilidade existente (${dbSlot.hora_inicio}–${dbSlot.hora_fim}).` 
                    }, { status: 400 });
                }
            }
        }

        await prisma.$transaction(async (tx) => {
            for (const slot of slots) {
                await (tx as any).mentor_disponibilidade.create({
                    data: {
                        id: crypto.randomUUID(),
                        mentor_id: mentorId,
                        data: slot.data,
                        hora_inicio: slot.hora_inicio,
                        hora_fim: slot.hora_fim,
                    }
                });
            }
        });

        return NextResponse.json({ message: "Disponibilidade atualizada com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error("Erro na API /api/mentor/availability:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
