import { NextResponse } from "next/server";
import { createOAuthState, OAUTH_STATE_COOKIE, oauthStateCookieOptions } from "@/src/lib/oauth-state";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "CANDIDATO";
    const origin = searchParams.get("origin") || "";

    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const callbackUrl = process.env.LINKEDIN_CALLBACK_URL!;

    const scope = encodeURIComponent("openid profile email");
    const { state: rawState, nonce } = createOAuthState(tipo, origin);
    const state = encodeURIComponent(rawState);

    const linkedinAuthUrl =
        `https://www.linkedin.com/oauth/v2/authorization` +
        `?response_type=code` +
        `&client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&scope=${scope}` +
        `&state=${state}`;

    const response = NextResponse.redirect(linkedinAuthUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, nonce, oauthStateCookieOptions());
    return response;
}
