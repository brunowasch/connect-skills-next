import { NextResponse } from "next/server";
import { createOAuthState, OAUTH_STATE_COOKIE, oauthStateCookieOptions } from "@/src/lib/oauth-state";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "CANDIDATO";
    const origin = searchParams.get("origin") || "";

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL!;

    const scope = encodeURIComponent("openid email profile");
    const { state: rawState, nonce } = createOAuthState(tipo, origin);
    const state = encodeURIComponent(rawState);

    const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&state=${state}` +
        `&access_type=offline` +
        `&prompt=select_account`;

    const response = NextResponse.redirect(googleAuthUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, nonce, oauthStateCookieOptions());
    return response;
}
