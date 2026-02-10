import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const { nome, sobrenome, cidade, estado, pais, ddi, ddd, numero, descricao, links, fotoPerfil, anexos } = data;

        // Upload para Cloudinary se for uma nova imagem (base64)
        let finalFotoPerfil = fotoPerfil;
        if (fotoPerfil && fotoPerfil.startsWith("data:image")) {
            try {
                finalFotoPerfil = await uploadToCloudinary(fotoPerfil, "candidate_profiles");
            } catch (error) {
                console.error("Erro ao fazer upload para Cloudinary:", error);
                return NextResponse.json({ error: "Erro ao processar imagem de perfil" }, { status: 500 });
            }
        }

        const telefone = `+${ddi}|${ddd}|${numero}`;

        // Atualizar candidato
        await prisma.candidato.update({
            where: { usuario_id: userId },
            data: {
                nome,
                sobrenome,
                cidade,
                estado,
                pais,
                telefone,
                descricao,
                foto_perfil: finalFotoPerfil
            }
        });

        await prisma.usuario.update({
            where: { id: userId },
            data: {
                avatarUrl: finalFotoPerfil,
                nome: nome,
                sobrenome: sobrenome
            }
        });


        // Atualizar links
        await prisma.candidato_link.deleteMany({
            where: { candidato: { usuario_id: userId } }
        });

        // Pega o ID do candidato
        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (candidate && links && links.length > 0) {
            const linksToInsert = links
                .filter((l: any) => l.url.trim() !== "")
                .map((l: any, index: number) => ({
                    id: randomUUID(),
                    candidato_id: candidate.id,
                    label: l.label || "Link",
                    url: l.url,
                    ordem: index
                }));

            if (linksToInsert.length > 0) {
                await prisma.candidato_link.createMany({
                    data: linksToInsert
                });
            }
        }

        // Atualizar anexos
        if (candidate) {
            const processedAnexos = [];

            if (anexos && anexos.length > 0) {
                for (const anexo of anexos) {
                    if (anexo.base64) {
                        // Novo arquivo
                        try {
                            const url = await uploadToCloudinary(anexo.base64, "candidate_attachments");
                            processedAnexos.push({
                                id: randomUUID(),
                                candidato_id: candidate.id,
                                nome: anexo.nome,
                                url: url,
                                mime: anexo.type || "application/octet-stream",
                                tamanho: anexo.size || 0
                            });
                        } catch (error) {
                            console.error("Erro ao subir anexo:", error);
                        }
                    } else if (anexo.id) {
                        const existing = await prisma.candidato_arquivo.findUnique({
                            where: { id: anexo.id }
                        });
                        if (existing) {
                            processedAnexos.push({
                                id: randomUUID(),
                                candidato_id: candidate.id,
                                nome: existing.nome,
                                url: existing.url,
                                mime: existing.mime,
                                tamanho: existing.tamanho
                            });
                        }
                    }
                }
            }

            // Buscar avaliações para filtrar anexos de vagas e não excluí-los
            const applications = await prisma.vaga_avaliacao.findMany({
                where: {
                    candidato_id: candidate.id
                },
                select: {
                    breakdown: true
                }
            });

            const vacancyFileIds = new Set<string>();
            
            applications.forEach(app => {
                try {
                    if (app.breakdown) {
                        const breakdown = JSON.parse(app.breakdown);
                        if (breakdown?.video?.fileId) {
                            vacancyFileIds.add(breakdown.video.fileId);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing breakdown:', e);
                }
            });

            // Remove todos (exceto os de vagas) e insere os processados
            await prisma.candidato_arquivo.deleteMany({
                where: { 
                    candidato_id: candidate.id,
                    id: {
                        notIn: Array.from(vacancyFileIds)
                    }
                }
            });

            if (processedAnexos.length > 0) {
                await prisma.candidato_arquivo.createMany({
                    data: processedAnexos
                });
            }
        }

        revalidatePath("/(pages)/candidate/(candidateApp)/dashboard", "page");
        revalidatePath("/(pages)/candidate/(candidateApp)/profile", "page");

        return NextResponse.json({ message: "Perfil atualizado!" });
    } catch (error: any) {
        console.error("Erro ao atualizar perfil:", error);
        return NextResponse.json({ error: "Erro interno ao atualizar perfil" }, { status: 500 });
    }
}
