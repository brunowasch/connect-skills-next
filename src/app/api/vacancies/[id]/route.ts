import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

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
                    opcao: data.opcao ? JSON.stringify(data.opcao) : null,
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

            // --- Sincronizar Anexos ---
            // Pegar IDs dos anexos que devem ser mantidos
            const keptAnexoIds = data.anexos
                .filter((a: any) => a.id)
                .map((a: any) => a.id);

            // Deletar os que não estão na lista
            await tx.vaga_arquivo.deleteMany({
                where: {
                    vaga_id: id,
                    id: { notIn: keptAnexoIds }
                }
            });

            // Adicionar os novos (que têm base64)
            if (data.anexos && data.anexos.length > 0) {
                for (const anexo of data.anexos) {
                    if (anexo.base64) {
                        try {
                            const url = await uploadToCloudinary(anexo.base64, "vacancy_attachments");
                            await tx.vaga_arquivo.create({
                                data: {
                                    id: randomUUID(),
                                    uuid: randomUUID(),
                                    vaga_id: id,
                                    nome: anexo.nome,
                                    url: url,
                                    mime: anexo.type || "application/octet-stream",
                                    tamanho: anexo.size || 0
                                }
                            });
                        } catch (error) {
                            console.error("Erro ao subir anexo da vaga:", error);
                        }
                    }
                }
            }

            // --- Sincronizar Links ---
            await tx.vaga_link.deleteMany({ where: { vaga_id: id } });
            if (data.links && data.links.length > 0) {
                const linksToCreate = data.links
                    .filter((l: any) => l.url.trim() !== "")
                    .map((link: any, index: number) => ({
                        id: randomUUID(),
                        uuid: randomUUID(),
                        vaga_id: id,
                        titulo: link.titulo || "Link",
                        url: link.url,
                        ordem: index + 1
                    }));

                if (linksToCreate.length > 0) {
                    await tx.vaga_link.createMany({
                        data: linksToCreate
                    });
                }
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
            await tx.vaga_arquivo.deleteMany({ where: { vaga_id: id } });
            await tx.vaga_link.deleteMany({ where: { vaga_id: id } });
            await tx.vaga_status.deleteMany({ where: { vaga_id: id } });

            await tx.vaga.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Error deleting vacancy:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
