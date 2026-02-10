import { prisma } from "@/src/lib/prisma";

export interface Notification {
    id: string;
    type: 'video_request' | 'feedback_approved' | 'feedback_rejected' | 'general' | 'video_received' | 'new_candidate';
    title: string;
    message: string;
    vacancyTitle: string;
    vacancyUuid?: string;
    vacancyId?: string;
    companyName?: string;
    candidateName?: string;
    candidateId?: string;
    date: Date;
    read: boolean;
    feedbackData?: {
        status: 'APPROVED' | 'REJECTED';
        justification: string;
    };
}

export async function getCompanyNotifications(companyId: string): Promise<Notification[]> {
    // 1. Buscar todas as vagas da empresa
    const vacancies = await prisma.vaga.findMany({
        where: { empresa_id: companyId },
        select: { id: true, cargo: true, uuid: true }
    });

    const vacancyIds = vacancies.map(v => v.id);
    const vacancyMap = new Map(vacancies.map(v => [v.id, v]));

    // 2. Buscar aplicações para essas vagas
    const applications = await prisma.vaga_avaliacao.findMany({
        where: { vaga_id: { in: vacancyIds } }
    });

    // 3. Buscar candidatos para essas aplicações
    const candidateIds = applications.map(app => app.candidato_id);
    const candidates = await prisma.candidato.findMany({
        where: { id: { in: candidateIds } },
        select: { id: true, nome: true }
    });
    
    const candidateMap = new Map(candidates.map(c => [c.id, c]));

    const notifications: Notification[] = [];

    for (const app of applications) {
        try {
            const vacancy = vacancyMap.get(app.vaga_id);
            const candidate = candidateMap.get(app.candidato_id);
            if (!vacancy) continue;

            const breakdown = app.breakdown ? JSON.parse(app.breakdown as string) : {};
            const candidateName = candidate?.nome || 'Candidato';

            // New Application
            // Se created_at existe, é uma nova candidatura.
            if (app.created_at && !breakdown?.company_notifications?.new_candidate?.deleted) {
                 notifications.push({
                    id: `new_candidate_${app.id}`,
                    type: 'new_candidate',
                    title: 'Nova Candidatura',
                    message: `${candidateName} se candidatou para a vaga ${vacancy.cargo}.`,
                    vacancyTitle: vacancy.cargo,
                    vacancyUuid: vacancy.uuid ?? undefined,
                    vacancyId: vacancy.id,
                    companyName: '',
                    candidateName: candidateName,
                    candidateId: app.candidato_id,
                    date: new Date(app.created_at),
                    read: breakdown?.company_notifications?.new_candidate?.read || false
                });
            }

            // Video Received
            if (breakdown?.video?.status === 'submitted' && breakdown?.video?.submittedAt && !breakdown?.company_notifications?.video_received?.deleted) {
                notifications.push({
                    id: `video_received_${app.id}`,
                    type: 'video_received',
                    title: 'Vídeo Recebido',
                    message: `${candidateName} enviou um vídeo de apresentação.`,
                    vacancyTitle: vacancy.cargo,
                    vacancyUuid: vacancy.uuid ?? undefined,
                    vacancyId: vacancy.id,
                    companyName: '',
                    candidateName: candidateName,
                    candidateId: app.candidato_id,
                    date: new Date(breakdown.video.submittedAt),
                    read: breakdown?.company_notifications?.video_received?.read || false
                });
            }

        } catch (e) {
            console.error("Error parsing breakdown for company notifications", e);
        }
    }

    return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getCandidateNotifications(candidateId: string): Promise<Notification[]> {
    // 1. Buscar todas as avaliações do candidato
    const applications = await prisma.vaga_avaliacao.findMany({
        where: { candidato_id: candidateId },
        select: {
            vaga_id: true,
            breakdown: true,
            created_at: true 
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
