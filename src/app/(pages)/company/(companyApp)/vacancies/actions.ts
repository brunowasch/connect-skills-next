"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { sendVideoRequestEmail } from "@/src/lib/mail";

export async function selectVacancyForRanking(vacancyId: string) {
    const cookieStore = await cookies();
    cookieStore.set("vacancy_ranking_id", vacancyId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    redirect("/company/vacancies/ranking");
}

export async function selectVacancyForEditing(vacancyId: string) {
    const cookieStore = await cookies();
    cookieStore.set("editing_vacancy_id", vacancyId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    redirect("/company/vacancies/edit");
}

export async function requestVideo(candidateId: string, vacancyId: string) {
    try {
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

        const vacancy = await prisma.vaga.findUnique({
            where: { id: vacancyId }
        });

        if (!candidate || !vacancy || !candidate.usuario) {
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

        const newBreakdown = {
            ...breakdownData,
            video: {
                status: 'requested',
                requestedAt: new Date().toISOString()
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

        return { success: true };
    } catch (error) {
        console.error("Error requesting video:", error);
        return { success: false, error: "Falha ao solicitar vídeo" };
    }
}

export async function submitFeedback(candidateId: string, vacancyId: string, status: 'APPROVED' | 'REJECTED', justification: string) {
    try {
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

        const newBreakdown = {
            ...breakdown,
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

        // Send email
        try {
            const candidate = await prisma.candidato.findUnique({
                where: { id: candidateId },
                include: { usuario: true }
            });
            const vacancy = await prisma.vaga.findUnique({ where: { id: vacancyId } });

            if (candidate?.usuario?.email && vacancy) {
                const { sendFeedbackEmail } = await import("@/src/lib/mail");
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
