import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

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

        await prisma.$transaction(async (tx) => {
            await (tx as any).mentor_disponibilidade.deleteMany({
                where: { mentor_id: mentorId }
            });

            for (const slot of slots) {
                await (tx as any).mentor_disponibilidade.create({
                    data: {
                        id: crypto.randomUUID(),
                        uuid: crypto.randomUUID(),
                        mentor_id: mentorId,
                        dia_semana: slot.dia_semana,
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
