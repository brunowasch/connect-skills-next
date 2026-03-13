import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "CANDIDATO";

    const clientId = process.env.FACEBOOK_CLIENT_ID!;
    const callbackUrl = process.env.FACEBOOK_CALLBACK_URL!;

    const scope = encodeURIComponent("email,public_profile");
    const state = encodeURIComponent(JSON.stringify({ tipo }));

    const facebookAuthUrl =
        `https://www.facebook.com/v19.0/dialog/oauth` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&state=${state}`;

    return NextResponse.redirect(facebookAuthUrl);
}
