import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-sync-secret");
    if (!secret || secret !== process.env.MENTORCONNECT_SYNC_SECRET) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Parâmetro 'token' é obrigatório." }, { status: 400 });
    }

    try {
        const entrevista = await (prisma as any).entrevista_mentor.findFirst({
            where: {
                link_reuniao: {
                    contains: token,
                },
                status: { in: ["CONFIRMADA", "CONCLUIDA"] },
            },
        });

        if (!entrevista) {
            return NextResponse.json({ error: "Reunião não encontrada ou não autorizada." }, { status: 404 });
        }

        const authorizedUsuarioIds: string[] = [];

        const mentor = await prisma.mentor.findUnique({
            where: { id: entrevista.mentor_id },
            select: { usuario_id: true },
        });
        if (mentor) authorizedUsuarioIds.push(mentor.usuario_id);

        const candidato = await prisma.candidato.findUnique({
            where: { id: entrevista.candidato_id },
            select: { usuario_id: true },
        });
        if (candidato) authorizedUsuarioIds.push(candidato.usuario_id);

        if (entrevista.vaga_id) {
            const vaga = await prisma.vaga.findUnique({
                where: { id: entrevista.vaga_id },
                select: { empresa_id: true },
            });
            if (vaga) {
                const empresa = await prisma.empresa.findUnique({
                    where: { id: vaga.empresa_id },
                    select: { usuario_id: true },
                });
                if (empresa) authorizedUsuarioIds.push(empresa.usuario_id);
            }
        }

        return NextResponse.json({
            entrevistaId: entrevista.id,
            data: entrevista.data,
            hora_inicio: entrevista.hora_inicio,
            hora_fim: entrevista.hora_fim,
            authorizedUsuarioIds,
            mentorUsuarioId: mentor?.usuario_id ?? null,
        });
    } catch (error) {
        console.error("Erro:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
