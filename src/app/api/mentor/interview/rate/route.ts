import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { isAuthorizedSyncRequest } from "@/src/lib/sync-auth";

export async function POST(req: NextRequest) {

    if (!isAuthorizedSyncRequest(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { entrevistaId, nota } = body;

        if (!entrevistaId || nota === undefined || nota === null) {
            return NextResponse.json({ error: "Parâmetros incompletos" }, { status: 400 });
        }

        if (typeof nota !== "number" || nota < 1 || nota > 5) {
            return NextResponse.json({ error: "Nota deve ser entre 1 e 5." }, { status: 400 });
        }

        const entrevista = await prisma.entrevista_mentor.findUnique({
            where: { id: entrevistaId },
        });

        if (!entrevista) {
            return NextResponse.json({ error: "Entrevista não encontrada" }, { status: 404 });
        }

        await prisma.entrevista_mentor.update({
            where: { id: entrevistaId },
            data: {
                nota_mentor: nota,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POST /api/mentor/interview/rate] Erro:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
