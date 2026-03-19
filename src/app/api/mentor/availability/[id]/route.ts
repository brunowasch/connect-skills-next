import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

        const slot = await (prisma as any).mentor_disponibilidade.findUnique({
            where: { id }
        });

        if (!slot || slot.mentor_id !== user.mentor.id) {
            return NextResponse.json({ error: "Horário não encontrado ou não pertence a você." }, { status: 404 });
        }

        await (prisma as any).mentor_disponibilidade.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Horário removido com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar disponibilidade:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
        const { dia_semana, hora_inicio, hora_fim } = body;

        const slot = await (prisma as any).mentor_disponibilidade.findUnique({
            where: { id }
        });

        if (!slot || slot.mentor_id !== user.mentor.id) {
            return NextResponse.json({ error: "Horário não encontrado ou não pertence a você." }, { status: 404 });
        }

        const diasMap: Record<string, number> = {
            "Domingo": 0,
            "Segunda-feira": 1,
            "Terça-feira": 2,
            "Quarta-feira": 3,
            "Quinta-feira": 4,
            "Sexta-feira": 5,
            "Sábado": 6
        };
        const diaInt = diasMap[dia_semana];

        if (diaInt === undefined) {
            return NextResponse.json({ error: "Dia da semana inválido." }, { status: 400 });
        }

        if (hora_inicio >= hora_fim) {
            return NextResponse.json({ error: "Horário de início não pode ser maior ou igual ao de término." }, { status: 400 });
        }

        const updatedSlot = await (prisma as any).mentor_disponibilidade.update({
            where: { id },
            data: {
                dia_semana: diaInt,
                hora_inicio,
                hora_fim
            }
        });

        return NextResponse.json(updatedSlot);

    } catch (error) {
        console.error("Erro ao atualizar disponibilidade:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
