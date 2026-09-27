import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSessionValue } from "@/src/lib/session";

export async function GET() {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);
    return NextResponse.json({ authenticated: !!userId });
}
