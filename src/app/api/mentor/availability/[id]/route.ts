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
