import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { specialties, usuario_id } = body;

        if (!specialties || !Array.isArray(specialties) || !usuario_id) {
            return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            include: { mentor: true }
        });

        if (!user || user.tipo !== "MENTOR" || !user.mentor) {
            return NextResponse.json({ error: "Mentor não encontrado." }, { status: 404 });
        }

        const mentorId = user.mentor.id;

        await prisma.$transaction(async (tx) => {
            await (tx as any).mentor_area.deleteMany({
                where: { mentor_id: mentorId }
            });
            for (const name of specialties) {
                let area = await tx.area_interesse.findFirst({
                    where: { nome: name }
                });

                if (!area) {
                    area = await tx.area_interesse.create({
                        data: {
                            uuid: crypto.randomUUID(),
                            nome: name,
                            padrao: false
                        }
                    });
                }

                await (tx as any).mentor_area.create({
                    data: {
                        mentor_id: mentorId,
                        area_interesse_id: area.id
                    }
                });
            }
        });

        return NextResponse.json({ message: "Especialidades atualizadas com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error("Erro na API /api/mentor/specialties:", error);
        return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
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

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { mentor: true }
        });

        if (!user || !user.mentor) {
            return NextResponse.json({ error: "Mentor não encontrado" }, { status: 404 });
        }

        const mentorId = user.mentor.id;

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

        await prisma.mentor_area.deleteMany({
            where: {
                mentor_id: mentorId,
                ...(areaIds.length > 0 ? {
                    area_interesse_id: {
                        notIn: areaIds
                    }
                } : {})
            }
        });

        for (const areaId of areaIds) {
            await prisma.mentor_area.upsert({
                where: {
                    mentor_id_area_interesse_id: {
                        mentor_id: mentorId,
                        area_interesse_id: areaId
                    }
                },
                update: {},
                create: {
                    mentor_id: mentorId,
                    area_interesse_id: areaId
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar áreas do mentor:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
