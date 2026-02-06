
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token ausente." }, { status: 400 });
    }

    try {
        // Find token
        const verificationToken = await (prisma as any).verification_token.findUnique({
            where: { token },
            include: { usuario: true }
        });

        if (!verificationToken) {
            return NextResponse.json({ error: "Token inválido." }, { status: 400 });
        }

        // Check expiration
        if (new Date() > verificationToken.expires_at) {
            return NextResponse.json({ error: "Token expirado." }, { status: 400 });
        }

        // Verify user
        await prisma.usuario.update({
            where: { id: verificationToken.usuario_id },
            data: { email_verificado: true },
        });

        // Delete token
        await (prisma as any).verification_token.delete({
            where: { id: verificationToken.id }
        });

        return NextResponse.json({ message: "Email verificado com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao verificar email." }, { status: 500 });
    }
}
