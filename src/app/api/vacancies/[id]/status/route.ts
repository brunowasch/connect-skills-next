import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        const { id } = await params; // Vaga ID

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const company = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
        });

        if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { situacao } = body;

        if (!situacao) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        // Create new status entry
        const statusEntry = await prisma.vaga_status.create({
            data: {
                id: randomUUID(),
                vaga_id: id,
                situacao: situacao, // e.g., "Ativa", "Encerrada"
                // criado_em defaults to now()
            }
        });

        return NextResponse.json(statusEntry);
    } catch (e) {
        console.error("Error updating vacancy status:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
