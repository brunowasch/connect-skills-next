
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ error: "Email e código são obrigatórios." }, { status: 400 });
        }

        // 1. Find User by Email
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
        }

        // 2. Find Token associated with User
        const verificationToken = await (prisma as any).verification_token.findFirst({
            where: {
                usuario_id: user.id,
                token: code
            }
        });

        if (!verificationToken) {
            // Log for debugging
            console.log(`Token invalido para user ${user.id}. Recebido: ${code}`);
            return NextResponse.json({ error: "Código inválido." }, { status: 400 });
        }

        // 3. Check Expiration
        if (new Date() > new Date(verificationToken.expires_at)) {
            return NextResponse.json({ error: "Código expirado." }, { status: 400 });
        }

        // 4. Verify User
        await prisma.usuario.update({
            where: { id: user.id },
            data: { email_verificado: true },
        });

        // 5. Delete Token
        await (prisma as any).verification_token.delete({
            where: { id: verificationToken.id }
        });

        // 6. Set Auth Cookie
        const response = NextResponse.json(
            {
                message: "Email verificado com sucesso!",
                redirectTo: user.tipo === "CANDIDATO" ? "/candidate/register" : "/company/register"
            },
            { status: 200 }
        );

        response.cookies.set("time_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return response;

    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return NextResponse.json({ error: "Erro interno ao verificar código." }, { status: 500 });
    }
}
