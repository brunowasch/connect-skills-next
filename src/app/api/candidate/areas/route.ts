import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            include: {
                candidato_area: {
                    include: {
                        area_interesse: true
                    }
                }
            }
        });

        if (!candidate) {
            return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
        }

        const areas = candidate.candidato_area.map(ca => ca.area_interesse.nome);

        return NextResponse.json({ areas });
    } catch (error) {
        console.error("Erro ao buscar áreas do candidato:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { selectedAreas } = await req.json();

        if (!Array.isArray(selectedAreas)) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId }
        });

        if (!candidate) {
            return NextResponse.json({ error: "Candidato não encontrado" }, { status: 404 });
        }

        const areaRecords = await Promise.all(
            selectedAreas.map(async (nome: string) => {
                return prisma.area_interesse.upsert({
                    where: { nome },
                    update: {},
                    create: { nome }
                });
            })
        );

        const areaIds = areaRecords.map(a => a.id);

        await prisma.candidato_area.deleteMany({
            where: {
                candidato_id: candidate.id,
                ...(areaIds.length > 0 ? {
                    area_interesse_id: {
                        notIn: areaIds
                    }
                } : {})
            }
        });

        for (const areaId of areaIds) {
            await prisma.candidato_area.upsert({
                where: {
                    candidato_id_area_interesse_id: {
                        candidato_id: candidate.id,
                        area_interesse_id: areaId
                    }
                },
                update: {},
                create: {
                    candidato_id: candidate.id,
                    area_interesse_id: areaId
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar áreas do candidato:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
