import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { parseSessionValue } from "@/src/lib/session";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { rawId } = await request.json();
        if (!rawId) return NextResponse.json({ error: "Missing rawId" }, { status: 400 });

        const result = await (prisma as any).notificacao.updateMany({
            where: { id: rawId, usuario_id: userId },
            data: { lida: true }
        });

        if (result.count === 0) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking mentor notification as read:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
