import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";

interface LinkedInTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    id_token?: string;
}

interface LinkedInUserInfo {
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    locale?: string | { language: string; country: string };
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
        console.error("[LinkedIn OAuth] Error from LinkedIn:", error);
        return NextResponse.redirect(`${appUrl}/login?error=linkedin_cancelled`);
    }

    if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=linkedin_no_code`);
    }

    let tipo: "CANDIDATO" | "EMPRESA" = "CANDIDATO";
    if (stateParam) {
        try {
            const stateObj = JSON.parse(decodeURIComponent(stateParam));
            if (stateObj.tipo === "EMPRESA" || stateObj.tipo === "CANDIDATO") {
                tipo = stateObj.tipo;
            }
        } catch {}
    }

    try {
        const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.LINKEDIN_CALLBACK_URL!,
                client_id: process.env.LINKEDIN_CLIENT_ID!,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
            }),
        });

        if (!tokenRes.ok) {
            const errBody = await tokenRes.text();
            console.error("[LinkedIn OAuth] Token exchange failed:", errBody);
            return NextResponse.redirect(`${appUrl}/login?error=linkedin_token_failed`);
        }

        const tokens: LinkedInTokenResponse = await tokenRes.json();

        const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userInfoRes.ok) {
            console.error("[LinkedIn OAuth] Failed to fetch user info");
            return NextResponse.redirect(`${appUrl}/login?error=linkedin_userinfo_failed`);
        }

        const linkedinUser: LinkedInUserInfo = await userInfoRes.json();

        if (!linkedinUser.email) {
            console.error("[LinkedIn OAuth] No email in user info");
            return NextResponse.redirect(`${appUrl}/login?error=linkedin_no_email`);
        }

        let user = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { linkedinId: linkedinUser.sub },
                    { email: linkedinUser.email },
                ],
            },
            include: {
                candidato: { include: { candidato_area: true } },
                empresa: true,
            },
        });

        if (user) {
            if (!user.linkedinId) {
                await prisma.usuario.update({
                    where: { id: user.id },
                    data: {
                        linkedinId: linkedinUser.sub,
                        avatarUrl: linkedinUser.picture ?? user.avatarUrl,
                        email_verificado: true,
                    },
                });
            }

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

        const userId = randomUUID();
        const userUuid = randomUUID();

        const newUser = await prisma.$transaction(async (tx) => {
            const created = await tx.usuario.create({
                data: {
                    id: userId,
                    uuid: userUuid,
                    email: linkedinUser.email!,
                    senha: "",
                    tipo,
                    email_verificado: true,
                    linkedinId: linkedinUser.sub,
                    avatarUrl: linkedinUser.picture ?? null,
                    nome: linkedinUser.given_name ?? null,
                    sobrenome: linkedinUser.family_name ?? null,
                },
            });

            if (tipo === "CANDIDATO") {
                let firstName = linkedinUser.given_name;
                let lastName = linkedinUser.family_name;

                if (!firstName && linkedinUser.name) {
                    const parts = linkedinUser.name.split(" ");
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
                        foto_perfil: linkedinUser.picture ?? null,
                    },
                });
            } else {
                await tx.empresa.create({
                    data: {
                        id: randomUUID(),
                        uuid: randomUUID(),
                        usuario_id: userId,
                        nome_empresa: linkedinUser.name ?? linkedinUser.given_name ?? "",
                        descricao: "",
                        foto_perfil: linkedinUser.picture ?? null,
                    },
                });
            }

            return created;
        });

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
        console.error("[LinkedIn OAuth] Unexpected error:", err);
        return NextResponse.redirect(`${appUrl}/login?error=linkedin_internal`);
    }
}