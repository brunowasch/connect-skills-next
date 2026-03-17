import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await req.json();
        const { nome, sobrenome, cidade, estado, pais, ddi, ddd, numero, bio, links, fotoPerfil, anexos } = data;

        // Fetch mentor to get ID and previous state
        const mentor = await prisma.mentor.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!mentor) {
            return NextResponse.json({ error: "Mentor não encontrado" }, { status: 404 });
        }

        let finalFotoPerfil = fotoPerfil;
        if (fotoPerfil && fotoPerfil.startsWith("data:image")) {
            try {
                finalFotoPerfil = await uploadToCloudinary(fotoPerfil, "mentor_profiles");
            } catch (error) {
                console.error("Erro ao fazer upload para Cloudinary:", error);
                return NextResponse.json({ error: "Erro ao processar imagem de perfil" }, { status: 500 });
            }
        }

        const telefone = `+${ddi}|${ddd}|${numero}`;

        await prisma.mentor.update({
            where: { usuario_id: userId },
            data: {
                nome,
                sobrenome,
                cidade,
                estado,
                pais,
                telefone,
                bio,
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

        await prisma.mentor_link.deleteMany({
            where: { mentor_id: mentor.id }
        });

        if (links && links.length > 0) {
            const linksToInsert = links
                .filter((l: any) => l.url.trim() !== "")
                .map((l: any, index: number) => ({
                    id: crypto.randomUUID(),
                    mentor_id: mentor.id,
                    label: l.label || "Link",
                    url: l.url,
                    ordem: index
                }));

            if (linksToInsert.length > 0) {
                await prisma.mentor_link.createMany({
                    data: linksToInsert
                });
            }
        }

        const processedAnexos = [];
        if (anexos && anexos.length > 0) {
            for (const anexo of anexos) {
                if (anexo.base64) {
                    try {
                        const url = await uploadToCloudinary(anexo.base64, "mentor_attachments");
                        processedAnexos.push({
                            id: crypto.randomUUID(),
                            mentor_id: mentor.id,
                            nome: anexo.nome,
                            url: url,
                            mime: anexo.type || "application/octet-stream",
                            tamanho: anexo.size || 0
                        });
                    } catch (error) {
                        console.error("Erro ao subir anexo do mentor:", error);
                    }
                } else if (anexo.id) {
                    const existing = await prisma.mentor_arquivo.findUnique({
                        where: { id: anexo.id }
                    });
                    if (existing) {
                        processedAnexos.push({
                            id: crypto.randomUUID(),
                            mentor_id: mentor.id,
                            nome: existing.nome,
                            url: existing.url,
                            mime: existing.mime,
                            tamanho: existing.tamanho
                        });
                    }
                }
            }
        }

        await prisma.mentor_arquivo.deleteMany({
            where: { mentor_id: mentor.id }
        });

        if (processedAnexos.length > 0) {
            await prisma.mentor_arquivo.createMany({
                data: processedAnexos
            });
        }

        revalidatePath("/(pages)/mentor/(mentorApp)/dashboard", "page");
        revalidatePath("/(pages)/mentor/(mentorApp)/profile", "page");

        return NextResponse.json({ message: "Perfil atualizado!" });
    } catch (error: any) {
        console.error("Erro ao atualizar perfil do mentor:", error);
        return NextResponse.json({ error: "Erro interno ao atualizar perfil" }, { status: 500 });
    }
}
