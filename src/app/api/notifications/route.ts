import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "userId é obrigatório." }, { status: 400 });
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
        const body = await req.json();

        if (body.markAllRead && body.userId) {
            await (prisma as any).notificacao.updateMany({
                where: {
                    usuario_id: body.userId,
                    lida: false
                },
                data: { lida: true }
            });
            return NextResponse.json({ success: true });
        }

        if (body.notificationId) {
            await (prisma as any).notificacao.update({
                where: { id: body.notificationId },
                data: { lida: true }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    } catch (error) {
        console.error("Erro na API PATCH /api/notifications:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
