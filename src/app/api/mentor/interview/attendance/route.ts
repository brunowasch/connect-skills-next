import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { isAuthorizedSyncRequest } from "@/src/lib/sync-auth";

export async function POST(req: NextRequest) {
    try {
        if (!isAuthorizedSyncRequest(req)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { entrevistaId, action } = body as {
            entrevistaId: string;
            action: "join" | "leave" | "mark_absent_by_mentor" | "mark_absent_auto";
        };

        if (!entrevistaId || !action) {
            return NextResponse.json({ error: "entrevistaId and action are required." }, { status: 400 });
        }

        const entrevista = await prisma.entrevista_mentor.findUnique({
            where: { id: entrevistaId },
        });

        if (!entrevista) {
            return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });
        }

        const now = new Date();
        const updateData: any = {};

        if (action === "join") {
            if (!entrevista.candidato_entrou_em) {
                updateData.candidato_entrou_em = now;
                updateData.candidato_compareceu = true;
            }
        } else if (action === "leave") {
            updateData.candidato_saiu_em = now;
        } else if (action === "mark_absent_by_mentor") {
            updateData.falta_marcada_pelo_mentor = true;
            updateData.candidato_compareceu = false;
        } else if (action === "mark_absent_auto") {
            if (!entrevista.candidato_compareceu) {
                updateData.candidato_compareceu = false;
            }
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.entrevista_mentor.update({
                where: { id: entrevistaId },
                data: updateData,
            });
        }

        return NextResponse.json({ success: true, updated: Object.keys(updateData).length > 0 });
    } catch (error) {
        console.error("[POST /api/mentor/interview/attendance] Erro:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
