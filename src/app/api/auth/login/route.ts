import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { comparePassword } from "@/src/lib/auth/hash";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, senha } = body;

        // 1. Validação de campos
        if (!email || !senha) {
            return NextResponse.json(
                { error: "Email e senha são obrigatórios." },
                { status: 400 }
            );
        }

        // 2. Busca usuário pelo email
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Credenciais inválidas." },
                { status: 401 }
            );
        }

        // 3. Verifica a senha
        const isValid = await comparePassword(senha, user.senha);

        if (!isValid) {
            return NextResponse.json(
                { error: "Credenciais inválidas." },
                { status: 401 }
            );
        }

        // 3.1 Verifica se o email foi verificado
        if (!user.email_verificado) {
            return NextResponse.json(
                { error: "Por favor, verifique seu email antes de fazer login." },
                { status: 403 }
            );
        }

        // 4. Retorno de sucesso (padrão igual ao register)
        const response = NextResponse.json(
            {
                id: user.id,
                email: user.email,
                tipo: user.tipo,
                redirectTo: user.tipo.toLocaleLowerCase() === 'candidato' ? "/candidate/dashboard" : "/company/dashboard"
            },
            { status: 200 }
        );

        // 5. Configura cookie
        response.cookies.set("time_user_id", user.id, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60,
            path: "/"
        });

        return response;

    } catch (err) {
        console.error("Erro no POST /api/auth/login:", err);
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}