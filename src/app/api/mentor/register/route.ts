import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { syncUserWithMentorConnect } from "@/src/lib/mentorconnect-sync";
import { getSessionUserId } from "@/src/lib/session";

export async function POST(req: Request) {
    try {
        const usuario_id = await getSessionUserId();
        if (!usuario_id) {
            return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
        }

        const body = await req.json();
        const { nome, sobrenome } = body;

        if (!nome) {
            return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            select: { tipo: true }
        });

        if (!usuario || usuario.tipo.toUpperCase() !== "MENTOR") {
            return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }

        // Update or create mentor profile
        await prisma.mentor.upsert({
            where: { usuario_id },
            update: {
                nome,
                sobrenome,
            },
            create: {
                id: crypto.randomUUID(),
                uuid: crypto.randomUUID(),
                usuario_id,
                nome,
                sobrenome,
            },
        });

        await syncUserWithMentorConnect(usuario_id);

        return NextResponse.json({ message: "Perfil de mentor atualizado com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error("Erro na API /api/mentor/register:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
