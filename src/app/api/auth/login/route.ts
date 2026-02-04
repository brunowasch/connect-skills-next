import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { comparePassword } from "@/src/lib/auth/hash";
import { cookies } from "next/headers";
import { generateVerificationCode } from "@/src/lib/code-generator";
import { sendLoginCodeEmail } from "@/src/lib/mail";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, senha, keepLogin } = body;

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
            include: { 
                candidato: {
                    include: { candidato_area: true }
                }, 
                empresa: true 
            }
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

        let isRegistrationComplete = false;
        const userType = user.tipo.toUpperCase();
        
        if (userType === "CANDIDATO") {
            const hasName = !!(user.candidato && user.candidato.nome && user.candidato.nome.trim() !== "");
            const hasAreas = user.candidato && user.candidato.candidato_area && user.candidato.candidato_area.length > 0;
            
            isRegistrationComplete = !!(hasName && hasAreas);
        } else if (userType === "EMPRESA") {
            isRegistrationComplete = !!(user.empresa && user.empresa.nome_empresa && user.empresa.nome_empresa.trim() !== "");
        }

        // 4. Verificação de Dispositivo Confiável
        const cookieStore = await cookies();
        const trustedDeviceCookie = cookieStore.get(`trusted_device_${user.id}`);

        if (trustedDeviceCookie) {
            let redirectTo = user.tipo.toLocaleLowerCase() === 'candidato' ? "/candidate/dashboard" : "/company/dashboard";

            if (!isRegistrationComplete) {
                if (user.tipo.toLowerCase() === 'candidato') {
                     const hasName = !!(user.candidato && user.candidato.nome && user.candidato.nome.trim() !== "");
                     if (hasName) {
                         redirectTo = "/candidate/area";
                     } else {
                         redirectTo = "/candidate/register";
                     }
                } else {
                     redirectTo = "/company/register";
                }
            }

            const response = NextResponse.json(
                {
                    id: user.id,
                    email: user.email,
                    tipo: user.tipo,
                    redirectTo
                },
                { status: 200 }
            );

            // 5. Configura cookie de sessão/persistente
            const cookieOptions: any = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            };

            const shouldKeepLogin = keepLogin === true;

            console.log(`[LOGIN] User: ${user.email}, KeepLogin: ${keepLogin}, ShouldKeep: ${shouldKeepLogin}`);

            let cookieValue = user.id;

            if (shouldKeepLogin) {
                const maxAge = 30 * 24 * 60 * 60; // 30 dias
                cookieOptions.maxAge = maxAge;
                cookieOptions.expires = new Date(Date.now() + maxAge * 1000);
                console.log("[LOGIN] Setting persistent cookie (30 days)");

                response.cookies.set("auth_mode", "persistent", {
                    maxAge,
                    path: "/",
                    secure: process.env.NODE_ENV === "production"
                });
            } else {
                console.log("[LOGIN] Setting session cookie (no maxAge)");
                cookieOptions.maxAge = undefined;
                cookieOptions.expires = undefined;

                response.cookies.set("auth_mode", "session", {
                    path: "/",
                    secure: process.env.NODE_ENV === "production"
                });
            }

            // Usando response.cookies.set para garantir que estamos modificando a resposta que será retornada
            response.cookies.set("time_user_id", cookieValue, cookieOptions);

            return response;
        } else {
            // Dispositivo não confiável, gerar código e pedir verificação
            const code = generateVerificationCode();

            // Limpa tokens antigos (opcional, mas bom pra evitar lixo)
            await prisma.verification_token.deleteMany({
                where: { usuario_id: user.id }
            });

            const tokenVal = `${user.id}:${code}`; // Token composto para garantir unicidade e validação

            await prisma.verification_token.create({
                data: {
                    id: randomUUID(),
                    usuario_id: user.id,
                    token: tokenVal,
                    expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
                }
            });

            const emailSent = await sendLoginCodeEmail(user.email, code);

            if (!emailSent) {
                return NextResponse.json(
                    { error: "Erro ao enviar email de verificação." },
                    { status: 500 }
                );
            }

            // Retorna indicando que precisa de verificação
            return NextResponse.json(
                {
                    requireVerification: true,
                    userId: user.id,
                    email: user.email
                },
                { status: 200 }
            );
        }

    } catch (err) {
        console.error("Erro no POST /api/auth/login:", err);
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}