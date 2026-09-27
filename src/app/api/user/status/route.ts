import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSessionUserId } from "@/src/lib/session";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ exists: false }, { status: 400 });
    }

    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
            include: {
                candidato: true,
                empresa: true,
            },
        });

        if (!user) {
            return NextResponse.json({ exists: false });
        }

        const sessionUserId = await getSessionUserId();

        if (sessionUserId !== user.id) {
            return NextResponse.json({ exists: true });
        }

        const nome       = user.candidato?.nome      ?? user.nome      ?? null;
        const sobrenome  = user.candidato?.sobrenome ?? user.sobrenome ?? null;
        const foto_perfil = user.candidato?.foto_perfil ?? user.avatarUrl ?? null;

        return NextResponse.json({
            exists: true,
            nome,
            sobrenome,
            foto_perfil,
            tipo: user.tipo,
        });
    } catch (e) {
        return NextResponse.json({ exists: false }, { status: 500 });
    }
}
