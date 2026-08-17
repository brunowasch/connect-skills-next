import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { parseSessionValue } from "@/src/lib/session";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

        if (!userId) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { uuid: true, email: true, tipo: true },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário autenticado:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
