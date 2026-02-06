"use server";

import { prisma } from "@/src/lib/prisma";
import { uploadToCloudinary } from "@/src/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function uploadVideoAction(
    vacancyId: string,
    userId: string, // Changed from candidateId to userId as frontend sends userId
    formData: FormData
) {
    try {
        // Resolve candidateId from userId
        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!candidate) {
            throw new Error("Candidato não encontrado");
        }
        
        const candidateId = candidate.id;

        const file = formData.get("video") as File;
        if (!file) {
            throw new Error("Nenhum vídeo enviado");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const fileUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const url = await uploadToCloudinary(fileUri, "videos");

        // Create candidato_arquivo record
        const fileId = crypto.randomUUID();
        await prisma.candidato_arquivo.create({
            data: {
                id: fileId,
                candidato_id: candidateId,
                nome: `Video_Apresentacao_${Date.now()}.mp4`,
                url: url,
                mime: file.type,
                tamanho: file.size,
                uuid: crypto.randomUUID()
            }
        });

        // Update application breakdown
        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: vacancyId,
                    candidato_id: candidateId
                }
            }
        });

        if (application) {
            let breakdown: any = {};
            try {
                if (application.breakdown) {
                    breakdown = JSON.parse(application.breakdown);
                }
            } catch (e) { }

            const newBreakdown = {
                ...breakdown,
                video: {
                    status: 'submitted',
                    submittedAt: new Date().toISOString(),
                    fileId: fileId,
                    url: url
                }
            };

            await prisma.vaga_avaliacao.update({
                where: { id: application.id },
                data: {
                    breakdown: JSON.stringify(newBreakdown)
                }
            });
        }

        revalidatePath(`/viewer/vacancy/${vacancyId}`);
        return { success: true };
    } catch (error) {
        console.error("Erro no upload de vídeo:", error);
        return { success: false, error: "Falha ao enviar vídeo" };
    }
}
