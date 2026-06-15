import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";
import { getRedirectTo } from "@/src/lib/auth-utils";
import { syncUserWithMentorConnect } from "@/src/lib/mentorconnect-sync";

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

    let tipo: "CANDIDATO" | "EMPRESA" | "MENTOR" = "CANDIDATO";
    let origin = "";
    if (stateParam) {
        try {
            const stateObj = JSON.parse(decodeURIComponent(stateParam));
            if (stateObj.tipo === "EMPRESA" || stateObj.tipo === "CANDIDATO" || stateObj.tipo === "MENTOR") {
                tipo = stateObj.tipo;
            }
            if (stateObj.origin) {
                origin = stateObj.origin;
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

        let linkedinUser: LinkedInUserInfo;

        if (tokens.id_token) {
            try {
                const payloadBase64 = tokens.id_token.split(".")[1];
                const decodedPayload = Buffer.from(payloadBase64, "base64").toString("utf-8");
                const payload = JSON.parse(decodedPayload);

                linkedinUser = {
                    sub: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    given_name: payload.given_name,
                    family_name: payload.family_name,
                    picture: payload.picture,
                    email_verified: payload.email_verified
                };
            } catch (decodeError) {
                console.error("[LinkedIn OAuth] Failed to decode id_token:", decodeError);
                const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
                    headers: { Authorization: `Bearer ${tokens.access_token}` },
                });

                if (!userInfoRes.ok) {
                    console.error("[LinkedIn OAuth] Failed to fetch user info");
                    return NextResponse.redirect(`${appUrl}/login?error=linkedin_userinfo_failed`);
                }
                linkedinUser = await userInfoRes.json();
            }
        } else {
            const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });

            if (!userInfoRes.ok) {
                console.error("[LinkedIn OAuth] Failed to fetch user info");
                return NextResponse.redirect(`${appUrl}/login?error=linkedin_userinfo_failed`);
            }
            linkedinUser = await userInfoRes.json();
        }

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
                mentor: { include: { mentor_area: true } }
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

            await syncUserWithMentorConnect(user.id);

            const mentorConnectUrl = process.env.MENTORCONNECT_URL || "http://localhost:3001";
            const redirectToStr = getRedirectTo(user);
            let nextUrl = `${appUrl}${redirectToStr}`;
            
            if (origin === "mentorconnect") {
                if (redirectToStr === "/candidate/dashboard" || redirectToStr === "/company/dashboard") {
                     nextUrl = `${mentorConnectUrl}/api/auth/social-callback?userId=${user.id}`;
                }
            }
            
            const response = NextResponse.redirect(nextUrl);
            
            if (origin === "mentorconnect" && nextUrl.startsWith(appUrl)) {
                response.cookies.set("register_origin", "mentorconnect", {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 30,
                });
            }
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
            } else if (tipo === "EMPRESA") {
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
            } else if (tipo === "MENTOR") {
                await tx.mentor.create({
                    data: {
                        id: randomUUID(),
                        uuid: randomUUID(),
                        usuario_id: userId,
                        nome: linkedinUser.given_name ?? "",
                        sobrenome: linkedinUser.family_name ?? "",
                        foto_perfil: linkedinUser.picture ?? null,
                    },
                });
            }

            return created;
        });

        // Sincronizar com MentorConnect (candidatos e mentores)
        await syncUserWithMentorConnect(newUser.id);

        const mentorConnectUrl = process.env.MENTORCONNECT_URL || "http://localhost:3001";
        const nextStep = tipo === "CANDIDATO" ? "/candidate/register" : (tipo === "MENTOR" ? "/mentor/register" : "/company/register");
        const response = NextResponse.redirect(`${appUrl}${nextStep}`);
        
        if (origin === "mentorconnect") {
            response.cookies.set("register_origin", "mentorconnect", {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 30,
            });
        }
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