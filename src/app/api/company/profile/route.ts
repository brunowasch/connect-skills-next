import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

export async function PUT(request: Request) {
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
        const { nome_empresa, fotoPerfil, descricao, telefone, cidade, estado, pais, anexos } = data;
        let photoUrl = fotoPerfil;

        // Upload to Cloudinary if base64 image
        if (photoUrl && photoUrl.startsWith('data:image')) {
            try {
                photoUrl = await uploadToCloudinary(photoUrl, "company_profiles");
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return NextResponse.json({ error: "Erro ao processar imagem de perfil" }, { status: 500 });
            }
        }

        const updatedCompany = await prisma.empresa.update({
            where: { id: company.id },
            data: {
                nome_empresa,
                foto_perfil: photoUrl,
                descricao,
                telefone,
                cidade,
                estado,
                pais,
            },
        });

        // Sync with usuario record
        await prisma.usuario.update({
            where: { id: userId },
            data: {
                avatarUrl: photoUrl,
                nome: nome_empresa
            }
        });

        // Processar anexos
        const processedAnexos = [];
        if (anexos && anexos.length > 0) {
            for (const anexo of anexos) {
                if (anexo.base64) {
                    // Novo arquivo
                    try {
                        const url = await uploadToCloudinary(anexo.base64, "company_attachments");
                        processedAnexos.push({
                            id: randomUUID(),
                            empresa_id: company.id,
                            nome: anexo.nome,
                            url: url,
                            mime: anexo.type || "application/octet-stream",
                            tamanho: anexo.size || 0
                        });
                    } catch (error) {
                        console.error("Erro ao subir anexo da empresa:", error);
                    }
                } else if (anexo.id) {
                    // Manter existente
                    processedAnexos.push({
                        id: anexo.id,
                        empresa_id: company.id,
                        nome: anexo.nome,
                        url: anexo.url,
                        mime: anexo.mime,
                        tamanho: anexo.tamanho
                    });
                }
            }
        }

        // Sincronizar anexos no banco
        await prisma.empresa_arquivo.deleteMany({
            where: { empresa_id: company.id }
        });

        if (processedAnexos.length > 0) {
            await prisma.empresa_arquivo.createMany({
                data: processedAnexos
            });
        }

        revalidatePath("/(pages)/company/(companyApp)/dashboard", "page");
        revalidatePath("/(pages)/company/(companyApp)/profile", "page");

        return NextResponse.json(updatedCompany);
    } catch (error) {
        console.error("Error updating company profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

