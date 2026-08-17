import { NextResponse } from "next/server";
import { getSessionUserId } from "@/src/lib/session";
import { createHandoffToken } from "@/src/lib/mentorconnect-handoff";

export async function GET() {
    const userId = await getSessionUserId();

    if (!userId) {
        return NextResponse.redirect(
            new URL("/login", process.env.APP_URL || "http://localhost:3000")
        );
    }

    const mentorConnectUrl = process.env.MENTORCONNECT_URL;

    if (!mentorConnectUrl) {
        console.error("[MentorConnect Handoff] MENTORCONNECT_URL não configurado.");
        return NextResponse.redirect(
            new URL("/", process.env.APP_URL || "http://localhost:3000")
        );
    }

    const token = createHandoffToken(userId);
    const target = new URL("/api/auth/social-callback", mentorConnectUrl);
    target.searchParams.set("token", token);

    return NextResponse.redirect(target.toString());
}
