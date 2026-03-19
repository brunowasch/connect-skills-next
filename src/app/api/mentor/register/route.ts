import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nome, sobrenome, usuario_id } = body;

        if (!nome || !usuario_id) {
            return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
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

        return NextResponse.json({ message: "Perfil de mentor atualizado com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error("Erro na API /api/mentor/register:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
    }
}
