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

        const diasMap: Record<string, number> = {
            "Domingo": 0,
            "Segunda-feira": 1,
            "Terça-feira": 2,
            "Quarta-feira": 3,
            "Quinta-feira": 4,
            "Sexta-feira": 5,
            "Sábado": 6
        };

        await prisma.$transaction(async (tx) => {
            for (const slot of slots) {
                const diaInt = diasMap[slot.dia_semana];
                
                if (diaInt === undefined) {
                    continue;
                }

                await (tx as any).mentor_disponibilidade.create({
                    data: {
                        id: crypto.randomUUID(),
                        mentor_id: mentorId,
                        dia_semana: diaInt,
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
