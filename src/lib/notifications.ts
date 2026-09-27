import { prisma } from "@/src/lib/prisma";

export interface Notification {
    id: string;
    type: 'video_request' | 'feedback_approved' | 'feedback_rejected' | 'general' | 'video_received' | 'new_candidate' | 'video_expired_unsubmitted' | 'interview_scheduled' | 'interview_confirmed' | 'interview_confirmed_mentor' | 'interview_cancelled_mentor' | 'interview_expired' | 'FEEDBACK_DISPONIVEL';
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
    extraData?: Record<string, any>;
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
        select: { id: true, nome: true, sobrenome: true }
    });

    const candidateMap = new Map(candidates.map(c => [c.id, c]));

    const notifications: Notification[] = [];

    for (const app of applications) {
        try {
            const vacancy = vacancyMap.get(app.vaga_id);
            const candidate = candidateMap.get(app.candidato_id);
            if (!vacancy) continue;

            const breakdown = app.breakdown ? JSON.parse(app.breakdown as string) : {};
            const candidateName = candidate ? (candidate.sobrenome ? `${candidate.nome} ${candidate.sobrenome}`.trim() : candidate.nome) : 'Candidato';

            if (app.created_at && !breakdown?.company_notifications?.new_candidate?.deleted) {
                notifications.push({
                    id: `new_candidate_${app.id}`,
                    type: 'new_candidate',
                    title: 'Nova Candidatura',
                    message: `${candidateName} se candidatou para a vaga ${vacancy.cargo}.`,
                    vacancyTitle: vacancy.cargo,
                    vacancyUuid: vacancy.uuid ?? undefined,
                    vacancyId: vacancy.id ?? undefined,
                    companyName: '',
                    candidateName: candidateName ?? undefined,
                    candidateId: app.candidato_id ?? undefined,
                    date: new Date(app.created_at),
                    read: breakdown?.company_notifications?.new_candidate?.read || false
                });
            }

            if (breakdown?.video?.status === 'submitted' && breakdown?.video?.submittedAt && !breakdown?.company_notifications?.video_received?.deleted) {
                notifications.push({
                    id: `video_received_${app.id}`,
                    type: 'video_received',
                    title: 'Vídeo Recebido',
                    message: `${candidateName} enviou um vídeo de apresentação.`,
                    vacancyTitle: vacancy.cargo,
                    vacancyUuid: vacancy.uuid ?? undefined,
                    vacancyId: vacancy.id ?? undefined,
                    companyName: '',
                    candidateName: candidateName ?? undefined,
                    candidateId: app.candidato_id ?? undefined,
                    date: new Date(breakdown.video.submittedAt),
                    read: breakdown?.company_notifications?.video_received?.read || false
                });
            }

            if (breakdown?.video?.status === 'requested' && breakdown?.video?.deadline && !breakdown?.company_notifications?.video_expired_unsubmitted?.deleted) {
                const deadlineDate = new Date(breakdown.video.deadline);
                const isExpired = new Date() > deadlineDate;

                if (isExpired) {
                    notifications.push({
                        id: `video_expired_unsubmitted_${app.id}`,
                        type: 'video_expired_unsubmitted',
                        title: 'Prazo de Vídeo Expirado',
                        message: `${candidateName} não enviou o vídeo dentro do prazo estipulado.`,
                        vacancyTitle: vacancy.cargo,
                        vacancyUuid: vacancy.uuid ?? undefined,
                        vacancyId: vacancy.id ?? undefined,
                        companyName: '',
                        candidateName: candidateName ?? undefined,
                        candidateId: app.candidato_id ?? undefined,
                        date: deadlineDate,
                        read: breakdown?.company_notifications?.video_expired_unsubmitted?.read || false
                    });
                }
            }

        } catch (e) {
            console.error("Error parsing breakdown for company notifications", e);
        }
    }

    try {
        const companyUser = await prisma.empresa.findUnique({
            where: { id: companyId },
            include: { usuario: { select: { id: true } } }
        });

        if (companyUser?.usuario?.id) {
            const interviewNotifs = await (prisma as any).notificacao.findMany({
                where: {
                    usuario_id: companyUser.usuario.id,
                    tipo: { in: ['ENTREVISTA_CONFIRMADA', 'ENTREVISTA_RECUSADA', 'MENTORIA_EXPIRADA', 'FEEDBACK_DISPONIVEL'] }
                },
                orderBy: { criado_em: 'desc' }
            });

            for (const notif of interviewNotifs) {
                const extraData = notif.dados ? JSON.parse(notif.dados) : {};
                const typeMapped: Notification['type'] =
                    notif.tipo === 'MENTORIA_EXPIRADA'
                        ? 'interview_expired'
                        : notif.tipo === 'FEEDBACK_DISPONIVEL'
                        ? 'FEEDBACK_DISPONIVEL'
                        : 'interview_confirmed';
                
                let candidateName = extraData.candidateName;
                if (!candidateName && extraData.candidatoId) {
                    const c = candidateMap.get(extraData.candidatoId);
                    if (c) {
                        candidateName = c.sobrenome ? `${c.nome} ${c.sobrenome}`.trim() : c.nome;
                    } else {
                        const candDB = await prisma.candidato.findUnique({ where: { id: extraData.candidatoId }, select: { nome: true, sobrenome: true } });
                        if (candDB) candidateName = candDB.sobrenome ? `${candDB.nome} ${candDB.sobrenome}`.trim() : candDB.nome;
                    }
                }
                if (!candidateName) candidateName = 'Candidato';

                let vacancyTitle = extraData.vacancyTitle;
                if (!vacancyTitle && extraData.vagaId) {
                    const v = vacancyMap.get(extraData.vagaId);
                    if (v) {
                        vacancyTitle = v.cargo;
                    } else {
                        const vagaDB = await prisma.vaga.findUnique({ where: { id: extraData.vagaId }, select: { cargo: true } });
                        if (vagaDB) vacancyTitle = vagaDB.cargo;
                    }
                }
                if (!vacancyTitle) vacancyTitle = 'Vaga';

                notifications.push({
                    id: `notificacao_${notif.id}`,
                    type: typeMapped,
                    title: notif.titulo,
                    message: notif.mensagem,
                    vacancyTitle,
                    candidateName,
                    date: new Date(notif.criado_em),
                    read: !!notif.lida,
                    extraData: { ...extraData, rawId: notif.id }
                });
            }
        }
    } catch (e) {
        console.error("Error fetching company interview notifications from notificacao:", e);
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
    try {
        const usuarioData = await prisma.candidato.findUnique({
            where: { id: candidateId },
            include: { usuario: { select: { id: true } } }
        });

        if (usuarioData?.usuario?.id) {
            const interviewNotifications = await (prisma as any).notificacao.findMany({
                where: {
                    usuario_id: usuarioData.usuario.id,
                    tipo: { in: ['ENTREVISTA_AGENDADA', 'ENTREVISTA_CONFIRMADA', 'ENTREVISTA_CANCELADA', 'ENTREVISTA_PRESENCIAL_AGENDADA', 'ENTREVISTA_PRESENCIAL_CONCLUIDA', 'FEEDBACK_DISPONIVEL'] }
                },
                orderBy: { criado_em: 'desc' }
            });

            for (const notif of interviewNotifications) {
                const extraData = notif.dados ? JSON.parse(notif.dados) : {};
                
                let mappedType = 'interview_confirmed';
                if (notif.tipo === 'ENTREVISTA_AGENDADA' || notif.tipo === 'ENTREVISTA_PRESENCIAL_AGENDADA') {
                    mappedType = 'interview_scheduled';
                } else if (notif.tipo === 'ENTREVISTA_PRESENCIAL_CONCLUIDA') {
                    mappedType = 'interview_confirmed'; // Reutilizando a badge de sucesso/confirmado
                } else if (notif.tipo === 'FEEDBACK_DISPONIVEL') {
                    mappedType = 'FEEDBACK_DISPONIVEL';
                }
                
                notifications.push({
                    id: `notificacao_${notif.id}`,
                    type: mappedType as any,
                    title: notif.titulo,
                    message: notif.mensagem,
                    vacancyTitle: '',
                    date: new Date(notif.criado_em),
                    read: !!notif.lida,
                    extraData
                });
            }
        }
    } catch (e) {
        console.error("Error fetching interview notifications using ORM:", e);
    }

    return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getMentorNotifications(mentorId: string): Promise<Notification[]> {
    try {
        const mentor = await prisma.mentor.findUnique({
            where: { id: mentorId },
            include: { usuario: { select: { id: true } } }
        });

        if (!mentor?.usuario?.id) return [];

        const rows = await (prisma as any).notificacao.findMany({
            where: {
                usuario_id: mentor.usuario.id,
                tipo: { in: ['ENTREVISTA_CONFIRMADA', 'ENTREVISTA_CANCELADA'] }
            },
            orderBy: { criado_em: 'desc' },
            take: 50
        });

        return rows.map((notif: any) => {
            const extraData = notif.dados ? JSON.parse(notif.dados) : {};
            const typeMapped: Notification['type'] =
                notif.tipo === 'ENTREVISTA_CONFIRMADA' ? 'interview_confirmed_mentor' : 'interview_cancelled_mentor';
            return {
                id: `notificacao_${notif.id}`,
                type: typeMapped,
                title: notif.titulo,
                message: notif.mensagem,
                vacancyTitle: '',
                date: new Date(notif.criado_em),
                read: !!notif.lida,
                extraData: { ...extraData, rawId: notif.id }
            } as Notification;
        });
    } catch (e) {
        console.error('Error fetching mentor notifications:', e);
        return [];
    }
}
