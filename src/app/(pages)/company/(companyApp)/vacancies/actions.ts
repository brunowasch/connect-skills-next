"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { sendVideoRequestEmail, sendFeedbackEmail } from "@/src/lib/mail";

export async function selectVacancyForRanking(vacancyUuid: string) {
    const cookieStore = await cookies();
    cookieStore.set("vacancy_ranking_uuid", vacancyUuid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    redirect(`/company/vacancies/${vacancyUuid}/ranking`);
}

export async function selectVacancyForEditing(vacancyUuid: string) {
    const cookieStore = await cookies();
    cookieStore.set("editing_vacancy_uuid", vacancyUuid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    redirect(`/company/vacancies/${vacancyUuid}/edit`);
}

export async function requestVideo(candidateId: string, vacancyUuid: string) {
    try {
        // Fetch vacancy ID from UUID
        const vacancy = await prisma.vaga.findFirst({
            where: {
                OR: [
                    { uuid: vacancyUuid },
                    { id: vacancyUuid }
                ]
            }
        });

        if (!vacancy) {
            throw new Error("Vaga não encontrada");
        }

        const vacancyId = vacancy.id;

        // 1. Fetch application to get current breakdown
        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: vacancyId,
                    candidato_id: candidateId
                }
            }
        });

        if (!application) {
            throw new Error("Candidatura não encontrada");
        }

        // 2. Fetch candidate and vacancy details for email
        const candidate = await prisma.candidato.findUnique({
            where: { id: candidateId },
            include: { usuario: true }
        });

        if (!candidate || !candidate.usuario) {
            throw new Error("Dados incompletos");
        }

        // 3. Update breakdown with video request
        let breakdownData = {};
        try {
            if (application.breakdown) {
                breakdownData = JSON.parse(application.breakdown);
            }
        } catch (e) {
            // ignore parse error/empty
        }

        // 3.1. Check if feedback already exists
        if (breakdownData && (breakdownData as any).feedback?.status) {
            throw new Error("Não é possível solicitar vídeo após enviar feedback ao candidato");
        }

        const requestDate = new Date();
        const deadline = new Date(requestDate);
        deadline.setDate(deadline.getDate() + 7); // 1 week for candidate to submit

        const newBreakdown = {
            ...breakdownData,
            video: {
                status: 'requested',
                requestedAt: requestDate.toISOString(),
                deadline: deadline.toISOString() // Candidate has 1 week to submit
            }
        };

        await prisma.vaga_avaliacao.update({
            where: { id: application.id },
            data: {
                breakdown: JSON.stringify(newBreakdown)
            }
        });

        // 4. Send Email
        const link = `${process.env.APP_URL}/viewer/vacancy/${vacancy.uuid}?action=upload_video`; // URL to force login and scroll to upload
        const result = await sendVideoRequestEmail(
            candidate.usuario.email,
            candidate.nome || "Candidato",
            vacancy.cargo,
            link
        );

        if (!result) {
            console.error("Falha ao enviar email de solicitação de vídeo (mas registro atualizado no banco).");
        }

        return { success: true };
    } catch (error) {
        console.error("Error requesting video:", error);
        return { success: false, error: "Falha ao solicitar vídeo" };
    }
}

export async function submitFeedback(candidateId: string, vacancyUuid: string, status: 'APPROVED' | 'REJECTED', justification: string) {
    try {
        // Fetch vacancy ID from UUID
        const vacancy = await prisma.vaga.findFirst({
            where: {
                OR: [
                    { uuid: vacancyUuid },
                    { id: vacancyUuid }
                ]
            }
        });

        if (!vacancy) throw new Error("Vaga não encontrada");

        const vacancyId = vacancy.id;

        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: vacancyId,
                    candidato_id: candidateId
                }
            }
        });

        if (!application) throw new Error("Candidatura não encontrada");

        let breakdown: any = {};
        try {
            if (application.breakdown) {
                breakdown = JSON.parse(application.breakdown);
            }
        } catch (e) { }

        let videoUpdate = {};
        if (breakdown.video && breakdown.video.status === 'submitted') {
            const expiresAt = breakdown.video.expiresAt ? new Date(breakdown.video.expiresAt) : null;
            const now = new Date();

            if (expiresAt) {
                if (now <= expiresAt) {
                    const newExpiresAt = new Date(now);
                    newExpiresAt.setDate(newExpiresAt.getDate() + 7);
                    videoUpdate = {
                        expiresAt: newExpiresAt.toISOString()
                    };
                } else {
                    videoUpdate = {
                        url: null,
                        fileId: null,
                        videoRemoved: true
                    };
                }
            }
        }

        const newBreakdown = {
            ...breakdown,
            video: {
                ...breakdown.video,
                ...videoUpdate
            },
            feedback: {
                status,
                justification,
                sentAt: new Date().toISOString()
            }
        };

        await prisma.vaga_avaliacao.update({
            where: { id: application.id },
            data: {
                breakdown: JSON.stringify(newBreakdown)
            }
        });

        try {
            const candidate = await prisma.candidato.findUnique({
                where: { id: candidateId },
                include: { usuario: true }
            });

            if (candidate?.usuario?.email && vacancy) {
                await sendFeedbackEmail(
                    candidate.usuario.email,
                    candidate.nome || "Candidato",
                    vacancy.cargo,
                    status,
                    justification
                );
            }
        } catch (mailError) {
            console.error("Erro ao enviar email de feedback:", mailError);
        }

        return { success: true };
    } catch (error) {
        console.error("Erro ao enviar feedback:", error);
        return { success: false, error: "Erro ao enviar feedback" };
    }
}
