import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-sync-secret");
    if (!secret || secret !== process.env.MENTORCONNECT_SYNC_SECRET) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { entrevistaId } = body as { entrevistaId?: string };

        if (!entrevistaId) {
            return NextResponse.json({ error: "entrevistaId é obrigatório." }, { status: 400 });
        }

        const entrevista = await (prisma as any).entrevista_mentor.findUnique({
            where: { id: entrevistaId },
        });

        if (!entrevista) {
            return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });
        }

        // Só encerra se o feedback já foi enviado e a reunião ainda está ativa
        if (!entrevista.feedback_enviado_em) {
            return NextResponse.json({ error: "Feedback ainda não enviado." }, { status: 400 });
        }

        if (entrevista.status === "CONCLUIDA") {
            // Já encerrada — idempotente
            return NextResponse.json({ success: true });
        }

        await (prisma as any).entrevista_mentor.update({
            where: { id: entrevistaId },
            data: { status: "CONCLUIDA" },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POST /api/mentor/interview/end] Erro:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
