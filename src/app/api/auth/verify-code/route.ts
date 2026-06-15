
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code, origin } = body;

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
        const verificationToken = await prisma.verification_token.findFirst({
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
        await prisma.verification_token.delete({
            where: { id: verificationToken.id }
        });

        // 6. Determine redirect destination
        const redirectTo = user.tipo === "CANDIDATO" ? "/candidate/register" : (user.tipo === "MENTOR" ? "/mentor/register" : "/company/register");

        // 7. Set Auth Cookie
        const response = NextResponse.json(
            {
                message: "Email verificado com sucesso!",
                redirectTo,
            },
            { status: 200 }
        );

        response.cookies.set("time_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        // 8. Se vier do MentorConnect, guarda cookie de origin para uso no passo final
        if (origin === "mentorconnect") {
            response.cookies.set("register_origin", "mentorconnect", {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 30,
            });
        }

        return response;

    } catch (error) {
        console.error("Erro ao verificar código:", error);
        return NextResponse.json({ error: "Erro interno ao verificar código." }, { status: 500 });
    }
}
