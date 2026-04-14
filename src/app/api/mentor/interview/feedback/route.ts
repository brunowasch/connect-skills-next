import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-sync-secret");
    if (!secret || secret !== process.env.MENTORCONNECT_SYNC_SECRET) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { entrevistaId, feedback_comportamental, feedback_tecnico, feedback_geral } = body as {
            entrevistaId?: string;
            feedback_comportamental?: string;
            feedback_tecnico?: string;
            feedback_geral?: string;
        };

        if (!entrevistaId) {
            return NextResponse.json({ error: "entrevistaId é obrigatório." }, { status: 400 });
        }
        if (!feedback_comportamental?.trim()) {
            return NextResponse.json({ error: "Feedback Comportamental é obrigatório." }, { status: 400 });
        }
        if (!feedback_tecnico?.trim()) {
            return NextResponse.json({ error: "Feedback Técnico é obrigatório." }, { status: 400 });
        }
        if (!feedback_geral?.trim()) {
            return NextResponse.json({ error: "Feedback Geral é obrigatório." }, { status: 400 });
        }

        const entrevista = await (prisma as any).entrevista_mentor.findUnique({
            where: { id: entrevistaId },
        });

        if (!entrevista) {
            return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });
        }

        await (prisma as any).entrevista_mentor.update({
            where: { id: entrevistaId },
            data: {
                feedback_comportamental: feedback_comportamental.trim(),
                feedback_tecnico: feedback_tecnico.trim(),
                feedback_geral: feedback_geral.trim(),
                feedback_enviado_em: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POST /api/mentor/interview/feedback] Erro:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
