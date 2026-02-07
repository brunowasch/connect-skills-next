import { prisma } from "@/src/lib/prisma";

export interface Notification {
    id: string;
    type: 'video_request' | 'feedback_approved' | 'feedback_rejected' | 'general';
    title: string;
    message: string;
    vacancyTitle: string;
    vacancyUuid?: string;
    companyName: string;
    date: Date;
    read: boolean;
    feedbackData?: {
        status: 'APPROVED' | 'REJECTED';
        justification: string;
    };
}

export async function getCandidateNotifications(candidateId: string): Promise<Notification[]> {
    // 1. Buscar todas as avaliações do candidato
    const applications = await prisma.vaga_avaliacao.findMany({
        where: { candidato_id: candidateId },
        select: {
            vaga_id: true,
            breakdown: true,
        }
    });

    // 2. Extrair IDs das vagas
    const vagaIds = applications.map(app => app.vaga_id);

    // 3. Buscar detalhes das vagas manualmente (pois não há relação no schema)
    const vagas = await prisma.vaga.findMany({
        where: {
            id: { in: vagaIds }
        },
        select: {
            id: true,
            uuid: true,
            cargo: true,
            empresa_id: true
        }
    });

    // 4. Mapa de vagas para acesso rápido
    const vagaMap = new Map(vagas.map(v => [v.id, v]));

    // 5. Extrair IDs das empresas
    const empresaIds = vagas.map(v => v.empresa_id);

    // 6. Buscar detalhes das empresas manualmente
    const empresas = await prisma.empresa.findMany({
        where: {
            id: { in: empresaIds }
        },
        select: {
            id: true,
            nome_empresa: true
        }
    });

    // 7. Mapa de empresas para acesso rápido
    const empresaMap = new Map(empresas.map(e => [e.id, e]));

    const notifications: Notification[] = [];

    for (const app of applications) {
        try {
            if (!app.breakdown) continue;
            
            const breakdown = JSON.parse(app.breakdown as string);
            const vaga = vagaMap.get(app.vaga_id);
            const empresa = vaga ? empresaMap.get(vaga.empresa_id) : undefined;

            const vacancyTitle = vaga?.cargo || 'Vaga';
            const companyName = empresa?.nome_empresa || 'Empresa';
            const vacancyUuid = vaga?.uuid ?? undefined;

            // Video Request
            if (breakdown?.video?.status === 'requested' && breakdown?.video?.requestedAt && !breakdown?.video?.deleted) {
                notifications.push({
                    id: `video_request_${app.vaga_id}`,
                    type: 'video_request',
                    title: 'Vídeo de Apresentação Solicitado',
                    message: 'A empresa solicitou um vídeo de apresentação de até 3 minutos.',
                    vacancyTitle,
                    vacancyUuid,
                    companyName,
                    date: new Date(breakdown.video.requestedAt),
                    read: breakdown?.video?.read || breakdown?.video?.status === 'submitted'
                });
            }

            // Feedback Approved
            if (breakdown?.feedback?.status === 'APPROVED' && breakdown?.feedback?.sentAt && !breakdown?.feedback?.deleted) {
                notifications.push({
                    id: `feedback_approved_${app.vaga_id}`,
                    type: 'feedback_approved',
                    title: 'Parabéns! Você foi aprovado',
                    message: breakdown?.feedback?.justification || 'A empresa aprovou sua candidatura.',
                    vacancyTitle,
                    vacancyUuid,
                    companyName,
                    date: new Date(breakdown.feedback.sentAt),
                    read: breakdown?.feedback?.read || false,
                    feedbackData: {
                        status: 'APPROVED',
                        justification: breakdown?.feedback?.justification || 'A empresa aprovou sua candidatura.'
                    }
                });
            }

            // Feedback Rejected
            if (breakdown?.feedback?.status === 'REJECTED' && breakdown?.feedback?.sentAt && !breakdown?.feedback?.deleted) {
                notifications.push({
                    id: `feedback_rejected_${app.vaga_id}`,
                    type: 'feedback_rejected',
                    title: 'Feedback Recebido',
                    message: breakdown?.feedback?.justification || 'A empresa enviou um feedback sobre sua candidatura.',
                    vacancyTitle,
                    vacancyUuid,
                    companyName,
                    date: new Date(breakdown.feedback.sentAt),
                    read: breakdown?.feedback?.read || false,
                    feedbackData: {
                        status: 'REJECTED',
                        justification: breakdown?.feedback?.justification || 'A empresa enviou um feedback sobre sua candidatura.'
                    }
                });
            }

        } catch (e) {
            console.error("Error parsing breakdown for notifications", e);
        }
    }

    return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
