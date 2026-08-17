import { NextResponse } from "next/server";
import { createOAuthState, OAUTH_STATE_COOKIE, oauthStateCookieOptions } from "@/src/lib/oauth-state";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "CANDIDATO";
    const origin = searchParams.get("origin") || "";

    const clientId = process.env.FACEBOOK_CLIENT_ID!;
    const callbackUrl = process.env.FACEBOOK_CALLBACK_URL!;

    const scope = encodeURIComponent("email,public_profile");
    const { state: rawState, nonce } = createOAuthState(tipo, origin);
    const state = encodeURIComponent(rawState);

    const facebookAuthUrl =
        `https://www.facebook.com/v19.0/dialog/oauth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&state=${state}`;

    const response = NextResponse.redirect(facebookAuthUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, nonce, oauthStateCookieOptions());
    return response;
}
