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

        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 }
            );
        }

        // Buscar candidato
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

        const vagaId = notificationId.split('_').pop() || '';

        if (!vagaId) {
            return NextResponse.json(
                { error: "Invalid notification ID" },
                { status: 400 }
            );
        }

        // Buscar a avaliação
        const avaliacao = await prisma.vaga_avaliacao.findFirst({
            where: {
                candidato_id: candidate.id,
                vaga_id: vagaId
            }
        });

        if (!avaliacao) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        // Atualizar o breakdown para marcar como lida
        let breakdown = {};
        try {
            breakdown = avaliacao.breakdown ? JSON.parse(avaliacao.breakdown) : {};
        } catch (e) {
            breakdown = {};
        }

        // Marcar como lida baseado no tipo de notificação
        if (notificationId.startsWith('video_request_')) {
            breakdown = {
                ...breakdown,
                video: {
                    ...(breakdown as any).video,
                    read: true
                }
            };
        } else if (notificationId.startsWith('feedback_')) {
            breakdown = {
                ...breakdown,
                feedback: {
                    ...(breakdown as any).feedback,
                    read: true
                }
            };
        }

        // Atualizar no banco
        await prisma.vaga_avaliacao.update({
            where: { id: avaliacao.id },
            data: {
                breakdown: JSON.stringify(breakdown)
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
