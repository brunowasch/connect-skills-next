import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
    const syncSecret = req.headers.get("x-sync-secret");

    if (!syncSecret || syncSecret !== process.env.SYNC_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { entrevistaId, nota } = body;

        if (!entrevistaId || !nota) {
            return NextResponse.json({ error: "Parâmetros incompletos" }, { status: 400 });
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
