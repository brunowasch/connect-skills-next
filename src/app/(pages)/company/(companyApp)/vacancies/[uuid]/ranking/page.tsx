import { prisma } from "@/src/lib/prisma";
import { RankingPageContent } from "./_components/RankingPageContent";

interface Props {
    params: Promise<{ uuid: string }>;
    searchParams: Promise<{ pendingCandidate?: string }>;
}

export default async function RankingPage({ params, searchParams }: Props) {
    const { uuid: vacancyUuid } = await params;
    const { pendingCandidate } = await searchParams;

    if (!vacancyUuid) {
        return <RankingPageContent state="no_selection" />;
    }

    const vacancy = await prisma.vaga.findFirst({
        where: {
            OR: [
                { uuid: vacancyUuid },
                { id: vacancyUuid }
            ]
        }
    });

    let company = null;
    if (vacancy?.empresa_id) {
        company = await prisma.empresa.findUnique({
            where: { id: vacancy.empresa_id }
        });
    }

    if (!vacancy) {
        return <RankingPageContent state="not_found" />;
    }

    const propostasAtivas = await (prisma as any).proposta.count({
        where: {
            vaga_id: vacancy.id,
            status: { in: ['PENDENTE_CANDIDATO', 'ACEITA'] }
        }
    });

    let vagasDisponiveis: number | null = null;
    if (vacancy.opcao) {
        try {
            const opcao = typeof vacancy.opcao === 'string' ? JSON.parse(vacancy.opcao) : vacancy.opcao;
            vagasDisponiveis = opcao?.vagas_disponiveis ? Number(opcao.vagas_disponiveis) : null;
        } catch { }
    }

    const vacancyId = vacancy.id;

    const applications = await prisma.vaga_avaliacao.findMany({
        where: { vaga_id: vacancyId },
        orderBy: { score: 'desc' }
    });

    const candidateIds = applications.map(app => app.candidato_id);

    const candidates = await prisma.candidato.findMany({
        where: { id: { in: candidateIds } },
        include: {
            usuario: {
                select: { email: true, avatarUrl: true }
            }
        }
    });

    const interviews = await prisma.entrevista_mentor.findMany({
        where: { vaga_id: vacancyId },
        select: {
            id: true,
            candidato_id: true,
            mentor_id: true,
            status: true,
            feedback_comportamental: true,
            feedback_tecnico: true,
            feedback_geral: true,
            nota_comportamental: true,
            nota_tecnica: true,
            nota_geral: true,
            nota_mentor: true,
            feedback_enviado_em: true,
            candidato_entrou_em: true,
            candidato_saiu_em: true,
            candidato_compareceu: true,
            falta_marcada_pelo_mentor: true,
        },
        orderBy: { criado_em: 'desc' }
    });

    const onsiteInterviews = await (prisma as any).entrevista_presencial.findMany({
        where: { vaga_id: vacancyId },
        select: {
            id: true,
            candidato_id: true,
            status: true,
        }
    });

    const mentorIds = [...new Set(interviews.map(i => i.mentor_id).filter(Boolean))];
    const mentors = mentorIds.length > 0 ? await prisma.mentor.findMany({
        where: { id: { in: mentorIds } },
        select: { id: true, nome: true, sobrenome: true, foto_perfil: true, uuid: true }
    }) : [];

    const candidatesWithApp = candidates.map(c => {
        const app = applications.find(a => a.candidato_id === c.id);
        const interview = interviews.find(i => i.candidato_id === c.id);
        const onsiteInterview = onsiteInterviews.find((i: any) => i.candidato_id === c.id);

        let finalStatus = interview?.status;
        if (!finalStatus && onsiteInterview) {
            finalStatus = onsiteInterview.status;
        }

        return {
            ...c,
            application: app ? {
                id: app.id,
                score: app.score,
                created_at: app.created_at,
                breakdown: app.breakdown,
                resposta: app.resposta,
                interviewStatus: finalStatus,
                mentorFeedback: interview ? {
                    comportamental: interview.feedback_comportamental,
                    tecnico: interview.feedback_tecnico,
                    geral: interview.feedback_geral,
                    nota_comportamental: interview.nota_comportamental,
                    nota_tecnica: interview.nota_tecnica,
                    nota_geral: interview.nota_geral,
                    nota_mentor: interview.nota_mentor,
                    enviado_em: interview.feedback_enviado_em,
                    candidato_entrou_em: interview.candidato_entrou_em,
                    candidato_saiu_em: interview.candidato_saiu_em,
                    candidato_compareceu: interview.candidato_compareceu,
                    falta_marcada_pelo_mentor: interview.falta_marcada_pelo_mentor,
                    mentor: (() => {
                        const m = mentors.find(m => m.id === interview.mentor_id);
                        if (!m) return null;
                        return {
                            nome: [m.nome, m.sobrenome].filter(Boolean).join(' ') || 'Mentor',
                            foto_perfil: m.foto_perfil,
                            uuid: m.uuid,
                        };
                    })(),
                } : null,
            } : undefined
        };
    });

    return (
        <RankingPageContent
            state="success"
            vacancy={{
                cargo: vacancy.cargo,
                id: vacancy.id,
                salario: vacancy.salario ? Number(vacancy.salario) : null,
                moeda: vacancy.moeda,
                tipo_local_trabalho: vacancy.tipo_local_trabalho,
                cidade: company?.cidade,
                estado: company?.estado
            }}
            candidates={candidatesWithApp}
            vacancyUuid={vacancyUuid}
            pendingCandidateId={pendingCandidate}
            vagasDisponiveis={vagasDisponiveis}
            propostasEnviadas={propostasAtivas}
        />
    );
}
