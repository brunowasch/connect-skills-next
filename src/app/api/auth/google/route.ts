import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "CANDIDATO";

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL!;

    const scope = encodeURIComponent("openid email profile");
    const state = encodeURIComponent(JSON.stringify({ tipo }));

    const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&state=${state}` +
        `&access_type=offline` +
        `&prompt=select_account`;

    return NextResponse.redirect(googleAuthUrl);
}
