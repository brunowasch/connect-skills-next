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

        await (prisma as any).notificacao.update({
            where: { id: rawId },
            data: { lida: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking mentor notification as read:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
