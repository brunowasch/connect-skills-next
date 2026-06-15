import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { rawId } = await request.json();
        if (!rawId) return NextResponse.json({ error: "Missing rawId" }, { status: 400 });

        await (prisma as any).notificacao.delete({ where: { id: rawId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting mentor notification:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
