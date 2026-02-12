
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

    const candidatesWithApp = candidates.map(c => {
        const app = applications.find(a => a.candidato_id === c.id);
        return {
            ...c,
            application: app ? {
                id: app.id,
                score: app.score,
                created_at: app.created_at,
                breakdown: app.breakdown,
                resposta: app.resposta
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
