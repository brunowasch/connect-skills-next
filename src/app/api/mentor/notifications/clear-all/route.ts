import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await (prisma as any).notificacao.deleteMany({
            where: {
                usuario_id: userId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error clearing mentor notifications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
