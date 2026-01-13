import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        const { id } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const company = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
        });

        if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Verify ownership
        const existingVacancy = await prisma.vaga.findFirst({
            where: { id, empresa_id: company.id }
        });

        if (!existingVacancy) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const data = await request.json();

        // Transaction
        const updatedVacancy = await prisma.$transaction(async (tx) => {
            // Update Vaga
            const vaga = await tx.vaga.update({
                where: { id },
                data: {
                    cargo: data.cargo,
                    descricao: data.descricao,
                    tipo_local_trabalho: data.tipo_local_trabalho,
                    escala_trabalho: data.escala_trabalho || '40h',
                    dias_presenciais: data.dias_presenciais ? Number(data.dias_presenciais) : null,
                    dias_home_office: data.dias_home_office ? Number(data.dias_home_office) : null,
                    salario: data.salario ? Number(data.salario) : null,
                    moeda: data.moeda || 'BRL',
                    beneficio: data.beneficio || null,
                    vinculo_empregaticio: data.vinculo_empregaticio,
                }
            });

            // Update Areas: Delete all, create new
            await tx.vaga_area.deleteMany({ where: { vaga_id: id } });
            if (data.areas && data.areas.length > 0) {
                await tx.vaga_area.createMany({
                    data: data.areas.map((areaId: number) => ({
                        vaga_id: id,
                        area_interesse_id: Number(areaId)
                    }))
                });
            }

            // Update Soft Skills
            await tx.vaga_soft_skill.deleteMany({ where: { vaga_id: id } });
            if (data.softSkills && data.softSkills.length > 0) {
                await tx.vaga_soft_skill.createMany({
                    data: data.softSkills.map((sk: any) => ({
                        vaga_id: id,
                        soft_skill_id: Number(sk)
                    }))
                });
            }

            return vaga;
        });

        return NextResponse.json(updatedVacancy);

    } catch (e) {
        console.error("Error updating vacancy:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        const { id } = await params;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const company = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
        });

        if (!company) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const existingVacancy = await prisma.vaga.findFirst({
            where: { id, empresa_id: company.id }
        });

        if (!existingVacancy) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            // Delete relations first
            await tx.vaga_area.deleteMany({ where: { vaga_id: id } });
            await tx.vaga_soft_skill.deleteMany({ where: { vaga_id: id } });
            await tx.vaga_avaliacao.deleteMany({ where: { vaga_id: id } });
            // maybe others like vaga_link, vaga_arquivo if they exist

            await tx.vaga.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Error deleting vacancy:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
