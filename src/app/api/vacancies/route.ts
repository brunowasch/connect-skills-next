import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const company = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
        });

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        const data = await request.json();

        // Validation (Basic)
        if (!data.cargo || !data.tipo_local_trabalho || !data.descricao) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const vagaId = randomUUID();

        // Transaction to ensure everything is created or nothing
        const result = await prisma.$transaction(async (tx) => {
            const vaga = await tx.vaga.create({
                data: {
                    id: vagaId,
                    uuid: randomUUID(), // Garantir UUID para acesso público
                    empresa_id: company.id,
                    cargo: data.cargo,
                    descricao: data.descricao,
                    tipo_local_trabalho: data.tipo_local_trabalho,
                    escala_trabalho: data.escala_trabalho || '40h',
                    dias_presenciais: data.dias_presenciais ? Number(data.dias_presenciais) : null,
                    dias_home_office: data.dias_home_office ? Number(data.dias_home_office) : null,
                    salario: data.salario ? Number(data.salario) : null,
                    moeda: data.moeda || 'BRL',
                    beneficio: data.beneficio || null,
                    pergunta: data.pergunta || null,
                    opcao: data.opcao ? JSON.stringify(data.opcao) : null, // Store inclusivity options as JSON
                    vinculo_empregaticio: data.vinculo_empregaticio,
                }
            });

            if (data.areas && data.areas.length > 0) {
                await tx.vaga_area.createMany({
                    data: data.areas.map((areaId: number) => ({
                        vaga_id: vagaId,
                        area_interesse_id: Number(areaId)
                    }))
                });
            }

            if (data.softSkills && data.softSkills.length > 0) {
                await tx.vaga_soft_skill.createMany({
                    data: data.softSkills.map((sk: any) => ({
                        vaga_id: vagaId,
                        soft_skill_id: Number(sk) // Assuming sk is ID
                    }))
                });
            }

            // Processar Anexos
            if (data.anexos && data.anexos.length > 0) {
                for (const anexo of data.anexos) {
                    if (anexo.base64) {
                        try {
                            const url = await uploadToCloudinary(anexo.base64, "vacancy_attachments");
                            await tx.vaga_arquivo.create({
                                data: {
                                    id: randomUUID(),
                                    uuid: randomUUID(),
                                    vaga_id: vagaId,
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

            // Processar Links
            if (data.links && data.links.length > 0) {
                const linksToCreate = data.links
                    .filter((l: any) => l.url.trim() !== "")
                    .map((link: any, index: number) => ({
                        id: randomUUID(),
                        uuid: randomUUID(),
                        vaga_id: vagaId,
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

            // Create initial status as 'Ativa'
            await tx.vaga_status.create({
                data: {
                    id: randomUUID(),
                    vaga_id: vagaId,
                    situacao: 'Ativa'
                }
            });

            return vaga;
        });

        return NextResponse.json(result);
    } catch (e) {
        console.error("Error creating vacancy:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
