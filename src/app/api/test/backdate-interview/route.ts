import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Não disponível em produção." }, { status: 403 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { interviewId } = body;

        const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

        if (interviewId) {
            await prisma.entrevista_mentor.update({
                where: { id: interviewId },
                data: { criado_em: fourDaysAgo },
            });
            return NextResponse.json({ success: true, updated: 1, interviewId });
        }

        const updated = await (prisma as any).entrevista_mentor.updateMany({
            where: { status: "PENDENTE_CANDIDATO" },
            data: { criado_em: fourDaysAgo },
        });

        return NextResponse.json({ success: true, updated: updated.count });
    } catch (error) {
        console.error("[TEST] Erro ao retrodar entrevistas:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
