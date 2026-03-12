import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "CANDIDATO";

    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const callbackUrl = process.env.LINKEDIN_CALLBACK_URL!;

    const scope = encodeURIComponent("openid profile email");
    const state = encodeURIComponent(JSON.stringify({ tipo }));

    const linkedinAuthUrl =
        `https://www.linkedin.com/oauth/v2/authorization` +
        `?response_type=code` +
        `&client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&scope=${scope}` +
        `&state=${state}`;

    return NextResponse.redirect(linkedinAuthUrl);
}
