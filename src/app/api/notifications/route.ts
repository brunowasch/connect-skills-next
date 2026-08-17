import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId } from "@/src/lib/session";

export async function GET(req: Request) {
    try {
        const userId = await getSessionUserId();

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }

        const notifications = await (prisma as any).notificacao.findMany({
            where: { usuario_id: userId },
            orderBy: { criado_em: 'desc' },
            take: 50
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Erro na API GET /api/notifications:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const userId = await getSessionUserId();

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }

        const body = await req.json();

        if (body.markAllRead) {
            await (prisma as any).notificacao.updateMany({
                where: {
                    usuario_id: userId,
                    lida: false
                },
                data: { lida: true }
            });
            return NextResponse.json({ success: true });
        }

        if (body.notificationId) {
            const result = await (prisma as any).notificacao.updateMany({
                where: {
                    id: body.notificationId,
                    usuario_id: userId
                },
                data: { lida: true }
            });

            if (result.count === 0) {
                return NextResponse.json({ error: "Notificação não encontrada." }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    } catch (error) {
        console.error("Erro na API PATCH /api/notifications:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
