"use server";

import { prisma } from "@/src/lib/prisma";
import { uploadToCloudinary, uploadBufferToCloudinary, generateUploadSignature } from "@/src/lib/cloudinary";

export async function getVideoUploadSignatureAction(
    vacancyUuid: string,
    userId: string
) {
    try {
        const vacancy = await prisma.vaga.findUnique({
            where: { uuid: vacancyUuid },
            select: { id: true }
        });

        if (!vacancy) throw new Error("Vaga não encontrada");

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true }
        });

        if (!candidate) throw new Error("Candidato não encontrado");

        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: vacancy.id,
                    candidato_id: candidate.id
                }
            }
        });

        if (application) {
            let breakdown: any = {};
            try {
                if (application.breakdown) {
                    breakdown = typeof application.breakdown === 'string' ? JSON.parse(application.breakdown) : application.breakdown;
                }
            } catch (e) { }

            if (breakdown?.feedback?.status === 'REJECTED') {
                return { success: false, error: "Não é possível enviar vídeo após receber feedback de reprovação" };
            }

            if (breakdown?.video?.status === 'submitted' && breakdown.video.viewedAt) {
                return { success: false, error: "O vídeo já foi visualizado pela empresa e não pode ser alterado." };
            }

            if (breakdown?.video?.status === 'requested') {
                const deadline = new Date(breakdown.video.deadline);
                const now = new Date();
                if (now > deadline) {
                    return { success: false, error: "O prazo para envio do vídeo expirou" };
                }
            }
        }

        const params = {
            folder: "videos",
        };

        const signatureData = generateUploadSignature(params);
        return { success: true, ...signatureData, folder: "videos" };

    } catch (error) {
        console.error("Erro ao gerar assinatura:", error);
        return { success: false, error: "Erro ao iniciar upload" };
    }
}

export async function saveVideoMetadataAction(
    vacancyUuid: string,
    userId: string,
    fileData: {
        url: string;
        fileName: string;
        mimeType: string;
        size: number;
    }
) {
    try {
        const vacancy = await prisma.vaga.findUnique({
            where: { uuid: vacancyUuid },
            select: { id: true, cargo: true, empresa_id: true }
        });

        if (!vacancy) throw new Error("Vaga não encontrada");

        const candidate = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: { id: true, nome: true, sobrenome: true }
        });

        if (!candidate) throw new Error("Candidato não encontrado");

        const fileId = crypto.randomUUID();

        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: vacancy.id,
                    candidato_id: candidate.id
                }
            }
        });

        if (application) {
            let breakdown: any = {};
            try {
                if (application.breakdown) {
                    breakdown = typeof application.breakdown === 'string' ? JSON.parse(application.breakdown) : application.breakdown;
                }
            } catch (e) { }

            // Re-validações de segurança
            if (breakdown?.feedback?.status === 'REJECTED') {
                throw new Error("Candidatura rejeitada");
            }

            if (breakdown?.video?.status === 'submitted' && breakdown.video.viewedAt) {
                throw new Error("O vídeo já foi visualizado pela empresa e não pode ser alterado.");
            }

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
                    url: fileData.url
                }
            };

            await prisma.vaga_avaliacao.update({
                where: { id: application.id },
                data: {
                    breakdown: JSON.stringify(newBreakdown)
                }
            });

            // Envio de Email
            try {
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
            } catch (emailError) {
                console.error("Erro ao enviar notificação por email:", emailError);
            }
        }

        revalidatePath(`/viewer/vacancy/${vacancyUuid}`);
        revalidatePath('/candidate/dashboard');
        revalidatePath('/company/dashboard');
        return { success: true };

    } catch (error) {
        console.error("Erro ao salvar metadados do vídeo:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erro ao salvar vídeo" };
    }
}
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

        const url = await uploadBufferToCloudinary(buffer, "videos", "video");

        const fileId = crypto.randomUUID();

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

            if (breakdown?.feedback?.status === 'REJECTED') {
                return {
                    success: false,
                    error: "Não é possível enviar vídeo após receber feedback de reprovação"
                };
            }

            if (breakdown?.video?.status === 'submitted' && breakdown.video.viewedAt) {
                return {
                    success: false,
                    error: "O vídeo já foi visualizado pela empresa e não pode ser alterado."
                };
            }

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
