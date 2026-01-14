import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const { nome, sobrenome, cidade, estado, pais, ddd, numero, descricao, links, fotoPerfil, anexos } = data;

        // Upload para Cloudinary se for uma nova imagem (base64)
        let finalFotoPerfil = fotoPerfil;
        if (fotoPerfil && fotoPerfil.startsWith("data:image")) {
            try {
                finalFotoPerfil = await uploadToCloudinary(fotoPerfil, "candidate_profiles");
            } catch (error) {
                console.error("Erro ao fazer upload para Cloudinary:", error);
                // Opcional: retornar erro ou continuar com o que tiver (base64)
                // Melhor falhar para não poluir o banco com base64 gigante
                return NextResponse.json({ error: "Erro ao processar imagem de perfil" }, { status: 500 });
            }
        }



        const telefone = `${ddd}${numero}`.replace(/\D/g, "");

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

        // Sync with usuario record
        await prisma.usuario.update({
            where: { id: userId },
            data: {
                avatarUrl: finalFotoPerfil,
                nome: nome,
                sobrenome: sobrenome
            }
        });


        // Atualizar links
        // Primeiro remove os antigos (estratégia simples)
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
                    label: "Link", // Ou extrair o domínio como label
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
                        // Arquivo existente (manter apenas se for necessário ou se quisermos recriar)
                        // Para simplificar seguindo a lógica do link, vamos recriar os existentes pegando os dados atuais
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

            // Remove todos e insere os processados
            await prisma.candidato_arquivo.deleteMany({
                where: { candidato_id: candidate.id }
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
