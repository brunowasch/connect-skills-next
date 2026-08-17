import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { parseSessionValue } from "@/src/lib/session";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);
        if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const empresa = await prisma.empresa.findUnique({ where: { usuario_id: userId } });
        if (!empresa) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

        const { id } = await params;

        const slot = await (prisma as any).entrevista_presencial_slot.findUnique({
            where: { id },
            include: { entrevista_presencial: true }
        });

        if (!slot) return NextResponse.json({ error: "Slot não encontrado." }, { status: 404 });
        if (slot.empresa_id !== empresa.id) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

        if (slot.entrevista_presencial?.status === "CONFIRMADA") {
            return NextResponse.json({ error: "Não é possível remover um horário já confirmado pelo candidato." }, { status: 400 });
        }

        await (prisma as any).entrevista_presencial_slot.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/company/onsite-interview/slots/[id]:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
