"use server";

import { prisma } from "@/src/lib/prisma";
import { uploadToCloudinary } from "@/src/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function uploadVideoAction(
    vacancyUuid: string,
    userId: string,
    formData: FormData
) {
    try {
        const vacancy = await prisma.vaga.findUnique({
            where: { uuid: vacancyUuid },
            select: { id: true }
        });

        if (!vacancy) {
            throw new Error("Vaga não encontrada");
        }

        const vacancyId = vacancy.id;

        // Resolve candidateId from userId
        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true, nome: true, sobrenome: true }
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
                nome: `${candidate.nome} ${candidate.sobrenome}-${Date.now()}-Video.mp4`,
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

            // Check if candidate was rejected
            if (breakdown?.feedback?.status === 'REJECTED') {
                return {
                    success: false,
                    error: "Não é possível enviar vídeo após receber feedback de reprovação"
                };
            }

            // Check if video was requested and deadline hasn't expired
            if (breakdown?.video?.status === 'requested') {
                const deadline = new Date(breakdown.video.deadline);
                const now = new Date();

                if (now > deadline) {
                    return {
                        success: false,
                        error: "O prazo para envio do vídeo expirou (1 semana após solicitação)"
                    };
                }
            }

            // Calculate video expiration: 1 week from submission
            const submittedAt = new Date();
            const expiresAt = new Date(submittedAt);
            expiresAt.setDate(expiresAt.getDate() + 7); 

            const newBreakdown = {
                ...breakdown,
                video: {
                    ...breakdown.video,
                    status: 'submitted',
                    submittedAt: submittedAt.toISOString(),
                    expiresAt: expiresAt.toISOString(),
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

            try {
                const vacancy = await prisma.vaga.findUnique({
                    where: { id: vacancyId },
                    select: { cargo: true, empresa_id: true }
                });

                if (vacancy) {
                    const company = await prisma.empresa.findUnique({
                        where: { id: vacancy.empresa_id },
                        select: { nome_empresa: true, usuario_id: true }
                    });

                    if (company) {
                        const companyUser = await prisma.usuario.findUnique({
                            where: { id: company.usuario_id },
                            select: { email: true }
                        });

                        if (companyUser && companyUser.email) {
                            const { shouldCompanyReceiveEmails } = await import("@/src/lib/company-settings");
                            
                            if (await shouldCompanyReceiveEmails(vacancy.empresa_id)) {
                                const { sendVideoReceivedEmail } = await import("@/src/lib/mail");
                                const candidateName = `${candidate.nome || ''} ${candidate.sobrenome || ''}`.trim() || "Candidato";
    
                                const redirectUrl = `/company/vacancies/${vacancyUuid}/candidates`;
                                const loginLink = `${process.env.APP_URL}/login?redirect=${encodeURIComponent(redirectUrl)}`;
                                
                                await sendVideoReceivedEmail(
                                    companyUser.email,
                                    company.nome_empresa,
                                    candidateName,
                                    vacancy.cargo,
                                    loginLink
                                );
                            }

                        }
                    }
                }
            } catch (emailError) {
                console.error("Erro ao enviar notificação por email:", emailError);
            }
        }

        revalidatePath(`/viewer/vacancy/${vacancyUuid}`);
        revalidatePath('/candidate/dashboard');
        revalidatePath('/company/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Erro no upload de vídeo:", error);
        return { success: false, error: "Falha ao enviar vídeo" };
    }
}
