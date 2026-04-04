import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";
import { getRedirectTo } from "@/src/lib/auth-utils";
import { syncUserWithMentorConnect } from "@/src/lib/mentorconnect-sync";

interface FacebookTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface FacebookUserInfo {
    id: string;
    email?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    picture?: {
        data: {
            url: string;
            is_silhouette: boolean;
        };
    };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    const appUrl = process.env.APP_URL || "http://localhost:3000";

    if (error) {
        console.error("[Facebook OAuth] Error from Facebook:", error);
        return NextResponse.redirect(`${appUrl}/login?error=facebook_cancelled`);
    }

    if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=facebook_no_code`);
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
        const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
        tokenUrl.searchParams.append("client_id", process.env.FACEBOOK_CLIENT_ID!);
        tokenUrl.searchParams.append("client_secret", process.env.FACEBOOK_CLIENT_SECRET!);
        tokenUrl.searchParams.append("redirect_uri", process.env.FACEBOOK_CALLBACK_URL!);
        tokenUrl.searchParams.append("code", code);

        const tokenRes = await fetch(tokenUrl.toString(), {
            method: "GET",
        });

        if (!tokenRes.ok) {
            const errBody = await tokenRes.text();
            console.error("[Facebook OAuth] Token exchange failed:", errBody);
            return NextResponse.redirect(`${appUrl}/login?error=facebook_token_failed`);
        }

        const tokens: FacebookTokenResponse = await tokenRes.json();

        // 2. Fetch user info from Facebook
        const userInfoRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,first_name,last_name,email,picture.type(large)&access_token=${tokens.access_token}`);

        if (!userInfoRes.ok) {
            console.error("[Facebook OAuth] Failed to fetch user info");
            return NextResponse.redirect(`${appUrl}/login?error=facebook_userinfo_failed`);
        }

        const facebookUser: FacebookUserInfo = await userInfoRes.json();

        if (!facebookUser.email) {
            console.error("[Facebook OAuth] No email in user info");
            return NextResponse.redirect(`${appUrl}/login?error=facebook_no_email`);
        }

        let user = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { facebookId: facebookUser.id },
                    { email: facebookUser.email },
                ],
            },
            include: {
                candidato: { include: { candidato_area: true } },
                empresa: true,
                mentor: { include: { mentor_area: true } }
            },
        });

        const pictureUrl = facebookUser.picture?.data?.url;

        if (user) {
            if (!user.facebookId) {
                await prisma.usuario.update({
                    where: { id: user.id },
                    data: {
                        facebookId: facebookUser.id,
                        avatarUrl: pictureUrl ?? user.avatarUrl,
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
                    email: facebookUser.email!,
                    senha: "",
                    tipo,
                    email_verificado: true,
                    facebookId: facebookUser.id,
                    avatarUrl: pictureUrl ?? null,
                    nome: facebookUser.first_name ?? null,
                    sobrenome: facebookUser.last_name ?? null,
                },
            });

            if (tipo === "CANDIDATO") {
                let firstName = facebookUser.first_name;
                let lastName = facebookUser.last_name;

                if (!firstName && facebookUser.name) {
                    const parts = facebookUser.name.split(" ");
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
                        foto_perfil: pictureUrl ?? null,
                    },
                });
            } else if (tipo === "EMPRESA") {
                await tx.empresa.create({
                    data: {
                        id: randomUUID(),
                        uuid: randomUUID(),
                        usuario_id: userId,
                        nome_empresa: facebookUser.name ?? facebookUser.first_name ?? "",
                        descricao: "",
                        foto_perfil: pictureUrl ?? null,
                    },
                });
            } else if (tipo === "MENTOR") {
                await tx.mentor.create({
                    data: {
                        id: randomUUID(),
                        uuid: randomUUID(),
                        usuario_id: userId,
                        nome: facebookUser.first_name ?? "",
                        sobrenome: facebookUser.last_name ?? "",
                        foto_perfil: pictureUrl ?? null,
                    },
                });
            }

            return created;
        });

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
        console.error("[Facebook OAuth] Unexpected error:", err);
        return NextResponse.redirect(`${appUrl}/login?error=facebook_internal`);
    }
}
