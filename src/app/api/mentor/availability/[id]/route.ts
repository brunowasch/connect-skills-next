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

        const slot = await (prisma as any).mentor_disponibilidade.findUnique({
            where: { id }
        });

        if (!slot || slot.mentor_id !== user.mentor.id) {
            return NextResponse.json({ error: "Horário não encontrado ou não pertence a você." }, { status: 404 });
        }

        if (!slotData) {
            return NextResponse.json({ error: "Data inválida." }, { status: 400 });
        }

        if (hora_inicio >= hora_fim) {
            return NextResponse.json({ error: "Horário de início não pode ser maior ou igual ao de término." }, { status: 400 });
        }

        const updatedSlot = await (prisma as any).mentor_disponibilidade.update({
            where: { id },
            data: {
                data: slotData,
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
