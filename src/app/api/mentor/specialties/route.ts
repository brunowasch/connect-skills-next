import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

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
