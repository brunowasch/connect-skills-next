import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { userId, code, rememberDevice, keepLogin } = await req.json();

        if (!userId || !code) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        const tokenVal = `${userId}:${code}`;

        const tokenRecord = await prisma.verification_token.findUnique({
            where: { token: tokenVal }
        });

        if (!tokenRecord) {
            return NextResponse.json({ error: "Código inválido." }, { status: 400 });
        }

        if (new Date() > tokenRecord.expires_at) {
            return NextResponse.json({ error: "Código expirado." }, { status: 400 });
        }

        // Consume token
        await prisma.verification_token.delete({ where: { id: tokenRecord.id } });

        // Get User
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { candidato: true, empresa: true }
        });
        if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

        // Verifica registro completo
        // @ts-ignore
        const isCandidateComplete = user.candidato && user.candidato.nome;
        // @ts-ignore
        const isCompanyComplete = user.empresa && user.empresa.nome_empresa && user.empresa.nome_empresa !== "";
        const isRegistrationComplete = isCandidateComplete || isCompanyComplete;

        let redirectTo = user.tipo.toLowerCase() === 'candidato' ? "/candidate/dashboard" : "/company/dashboard";

        if (!isRegistrationComplete) {
            redirectTo = user.tipo.toLowerCase() === 'candidato' ? "/candidate/register" : "/company/register";
        }

        const response = NextResponse.json({
            success: true,
            redirectTo
        });

        // 2. Trusted Device Cookie
        if (rememberDevice) {
            response.cookies.set(`trusted_device_${user.id}`, "true", {
                maxAge: 30 * 24 * 60 * 60,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/"
            });
        }

        // 1. Session Cookie (time_user_id)
        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        };

        const shouldKeepLogin = keepLogin === true;
        console.log(`[VERIFY-LOGIN] User: ${userId}, KeepLogin: ${keepLogin} (Type: ${typeof keepLogin}), ShouldKeep: ${shouldKeepLogin}`);

        let cookieValue = user.id;



        if (shouldKeepLogin) {
            const maxAge = 30 * 24 * 60 * 60;
            cookieOptions.maxAge = maxAge;
            cookieOptions.expires = new Date(Date.now() + maxAge * 1000);
            console.log("[VERIFY-LOGIN] Setting persistent cookie");

            // Client-side marker (readable)
            response.cookies.set("auth_mode", "persistent", {
                maxAge,
                path: "/",
                secure: process.env.NODE_ENV === "production"
            });

        } else {
            console.log("[VERIFY-LOGIN] Setting session cookie - User opted out of 'Keep Login'");
            cookieOptions.maxAge = undefined;
            cookieOptions.expires = undefined;

            // Client-side marker (readable)
            response.cookies.set("auth_mode", "session", {
                path: "/",
                secure: process.env.NODE_ENV === "production"
            });
        }

        response.cookies.set("time_user_id", cookieValue, cookieOptions);

        return response;

    } catch (err) {
        console.error("Erro verify-login:", err);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
