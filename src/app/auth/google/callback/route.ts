import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";

interface GoogleTokenResponse {
    access_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

interface GoogleUserInfo {
    sub: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email_verified?: boolean;
}

function getRedirectTo(user: {
    tipo: string;
    candidato: {
        nome: string | null;
        data_nascimento: Date | null;
        candidato_area: { candidato_id: string; area_interesse_id: number }[];
    } | null;
    empresa: {
        nome_empresa: string;
    } | null;
}): string {
    const userType = user.tipo.toUpperCase();
    let isRegistrationComplete = false;

    if (userType === "CANDIDATO") {
        const hasName = !!(user.candidato?.nome?.trim());
        const hasDate = !!(user.candidato?.data_nascimento);
        const hasAreas = !!(user.candidato?.candidato_area?.length);
        isRegistrationComplete = hasName && hasDate && hasAreas;
    } else if (userType === "EMPRESA") {
        isRegistrationComplete = !!(user.empresa?.nome_empresa?.trim());
    }

    if (isRegistrationComplete) {
        return userType === "CANDIDATO" ? "/candidate/dashboard" : "/company/dashboard";
    }

    if (userType === "CANDIDATO") {
        const hasName = !!(user.candidato?.nome?.trim());
        const hasDate = !!(user.candidato?.data_nascimento);
        return (hasName && hasDate) ? "/candidate/area" : "/candidate/register";
    }

    return "/company/register";
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    const appUrl = process.env.APP_URL || "http://localhost:3000";

    if (error) {
        console.error("[Google OAuth] Error from Google:", error);
        return NextResponse.redirect(`${appUrl}/login?error=google_cancelled`);
    }

    if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=google_no_code`);
    }

    // Parse state to retrieve the user-chosen tipo (if new user)
    let tipo: "CANDIDATO" | "EMPRESA" = "CANDIDATO";
    if (stateParam) {
        try {
            const stateObj = JSON.parse(decodeURIComponent(stateParam));
            if (stateObj.tipo === "EMPRESA" || stateObj.tipo === "CANDIDATO") {
                tipo = stateObj.tipo;
            }
        } catch {
            // Ignore parse errors; use default tipo
        }
    }

    try {
        // 1. Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenRes.ok) {
            const errBody = await tokenRes.text();
            console.error("[Google OAuth] Token exchange failed:", errBody);
            return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`);
        }

        const tokens: GoogleTokenResponse = await tokenRes.json();

        // 2. Fetch user info from Google
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userInfoRes.ok) {
            console.error("[Google OAuth] Failed to fetch user info");
            return NextResponse.redirect(`${appUrl}/login?error=google_userinfo_failed`);
        }

        const googleUser: GoogleUserInfo = await userInfoRes.json();

        if (!googleUser.email) {
            return NextResponse.redirect(`${appUrl}/login?error=google_no_email`);
        }

        // 3. Find existing user by googleId OR by email
        let user = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { googleId: googleUser.sub },
                    { email: googleUser.email },
                ],
            },
            include: {
                candidato: { include: { candidato_area: true } },
                empresa: true,
            },
        });

        if (user) {
            // Existing user – link googleId if not yet linked
            if (!user.googleId) {
                await prisma.usuario.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleUser.sub,
                        avatarUrl: googleUser.picture ?? user.avatarUrl,
                        email_verificado: true,
                    },
                });
            }

            // Ensure uuid exists
            if (!user.uuid) {
                const newUuid = randomUUID();
                await prisma.usuario.update({
                    where: { id: user.id },
                    data: { uuid: newUuid },
                });
                user.uuid = newUuid;
            }

            const redirectTo = getRedirectTo(user);

            const response = NextResponse.redirect(`${appUrl}${redirectTo}`);
            response.cookies.set("time_user_id", user.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60,
            });
            response.cookies.set("auth_mode", "persistent", {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                maxAge: 30 * 24 * 60 * 60,
            });

            return response;
        }

        // 4. New user – create account
        const userId = randomUUID();
        const userUuid = randomUUID();

        const newUser = await prisma.$transaction(async (tx) => {
            const created = await tx.usuario.create({
                data: {
                    id: userId,
                    uuid: userUuid,
                    email: googleUser.email,
                    senha: "", // Google users have no password
                    tipo,
                    email_verificado: true,
                    googleId: googleUser.sub,
                    avatarUrl: googleUser.picture ?? null,
                    nome: googleUser.given_name ?? null,
                    sobrenome: googleUser.family_name ?? null,
                },
            });

            if (tipo === "CANDIDATO") {
                let firstName = googleUser.given_name;
                let lastName = googleUser.family_name;

                if (!firstName && googleUser.name) {
                    const parts = googleUser.name.split(" ");
                    firstName = parts[0];
                    if (parts.length > 1) {
                        lastName = parts.slice(1).join(" ");
                    }
                }

                await tx.candidato.create({
                    data: {
                        id: randomUUID(),
                        uuid: randomUUID(),
                        usuario_id: userId,
                        nome: firstName ?? "",
                        sobrenome: lastName ?? "",
                        foto_perfil: googleUser.picture ?? null,
                    },
                });
            } else {
                await tx.empresa.create({
                    data: {
                        id: randomUUID(),
                        uuid: randomUUID(),
                        usuario_id: userId,
                        nome_empresa: googleUser.name ?? googleUser.given_name ?? "",
                        descricao: "",
                        foto_perfil: googleUser.picture ?? null,
                    },
                });
            }

            return created;
        });

        // Redirect new user to complete registration
        const redirectTo = tipo === "CANDIDATO" ? "/candidate/register" : "/company/register";

        const response = NextResponse.redirect(`${appUrl}${redirectTo}`);
        response.cookies.set("time_user_id", newUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });
        response.cookies.set("auth_mode", "persistent", {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;

    } catch (err) {
        console.error("[Google OAuth] Unexpected error:", err);
        return NextResponse.redirect(`${appUrl}/login?error=google_internal`);
    }
}