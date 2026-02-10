import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!candidate) {
            return NextResponse.json(
                { error: "Candidate not found" },
                { status: 404 }
            );
        }

        // 1. Buscar todas as avaliações
        const applications = await prisma.vaga_avaliacao.findMany({
            where: { candidato_id: candidate.id }
        });

        // 2. Iterar e atualizar
        for (const app of applications) {
            let breakdown: any = {};
            try {
                breakdown = app.breakdown ? JSON.parse(app.breakdown as string) : {};
            } catch (e) {
                breakdown = {};
            }

            let updated = false;

            // Mark video as deleted if needed
            if (breakdown?.video?.status === 'requested' && !breakdown?.video?.deleted) {
                breakdown.video.deleted = true;
                updated = true;
            }

            // Mark feedback as deleted if needed
            if ((breakdown?.feedback?.status === 'APPROVED' || breakdown?.feedback?.status === 'REJECTED') && !breakdown?.feedback?.deleted) {
                breakdown.feedback.deleted = true;
                updated = true;
            }

            if (updated) {
                await prisma.vaga_avaliacao.update({
                    where: { id: app.id },
                    data: {
                        breakdown: JSON.stringify(breakdown)
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
