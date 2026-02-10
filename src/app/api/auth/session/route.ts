import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;
    return NextResponse.json({ userId: userId || null });
}
