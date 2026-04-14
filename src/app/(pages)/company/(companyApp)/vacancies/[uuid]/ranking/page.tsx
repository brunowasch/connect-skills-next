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
        },
    });

    if (!vacancy) {
        return <RankingPageContent state="not_found" />;
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
            candidato_id: true, 
            status: true,
            feedback_comportamental: true,
            feedback_tecnico: true,
            feedback_geral: true,
            nota_comportamental: true,
            nota_tecnica: true,
            nota_geral: true,
            feedback_enviado_em: true,
        },
        orderBy: { criado_em: 'desc' }
    });

    const candidatesWithApp = candidates.map(c => {
        const app = applications.find(a => a.candidato_id === c.id);
        const interview = interviews.find(i => i.candidato_id === c.id);
        return {
            ...c,
            application: app ? {
                id: app.id,
                score: app.score,
                created_at: app.created_at,
                breakdown: app.breakdown,
                resposta: app.resposta,
                interviewStatus: interview?.status,
                mentorFeedback: interview?.feedback_enviado_em ? {
                    comportamental: interview.feedback_comportamental,
                    tecnico: interview.feedback_tecnico,
                    geral: interview.feedback_geral,
                    nota_comportamental: interview.nota_comportamental,
                    nota_tecnica: interview.nota_tecnica,
                    nota_geral: interview.nota_geral,
                    enviado_em: interview.feedback_enviado_em,
                } : null,
            } : undefined
        };
    });

    return (
        <RankingPageContent
            state="success"
            vacancy={{ cargo: vacancy.cargo, id: vacancy.id }}
            candidates={candidatesWithApp}
            vacancyUuid={vacancyUuid}
            pendingCandidateId={pendingCandidate}
        />
    );
}
