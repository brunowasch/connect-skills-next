import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { isOnsiteSlotPast } from "@/src/lib/onsite-slot";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const empresa = await prisma.empresa.findUnique({ where: { usuario_id: userId } });
        if (!empresa) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

        const slots = await prisma.entrevista_presencial_slot.findMany({
            where: { empresa_id: empresa.id },
            include: {
                entrevista_presencial: {
                    select: {
                        id: true,
                        status: true,
                        candidato_id: true,
                    }
                }
            },
            orderBy: [{ data: "asc" }, { hora_inicio: "asc" }]
        });

        const enriched = await Promise.all(slots.map(async (slot: any) => {
            if (slot.entrevista_presencial?.candidato_id) {
                const candidato = await prisma.candidato.findUnique({
                    where: { id: slot.entrevista_presencial.candidato_id },
                    select: { nome: true, sobrenome: true, foto_perfil: true, uuid: true, usuario: { select: { avatarUrl: true } } }
                });
                return { ...slot, candidato };
            }
            return { ...slot, candidato: null };
        }));

        return NextResponse.json({ slots: enriched });
    } catch (error) {
        console.error("GET /api/company/onsite-interview/slots:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const empresa = await prisma.empresa.findUnique({ where: { usuario_id: userId } });
        if (!empresa) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

        const { data: dataValue, hora_inicio } = await req.json();
        if (!dataValue || !hora_inicio) {
            return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
        }
        if (isOnsiteSlotPast(dataValue, hora_inicio)) {
            return NextResponse.json({ error: "Não é possível publicar um horário que já passou." }, { status: 400 });
        }

        const slot = await prisma.entrevista_presencial_slot.create({
            data: {
                id: randomUUID(),
                empresa_id: empresa.id,
                data: dataValue,
                hora_inicio
            }
        });

        return NextResponse.json({ success: true, slot });
    } catch (error) {
        console.error("POST /api/company/onsite-interview/slots:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
