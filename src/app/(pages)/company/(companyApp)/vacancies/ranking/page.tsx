import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { RankingPageContent } from "./_components/RankingPageContent";

export default async function RankingPage() {
    const cookieStore = await cookies();
    const vacancyId = cookieStore.get("vacancy_ranking_id")?.value;

    if (!vacancyId) {
        return <RankingPageContent state="no_selection" />;
    }

    const vacancy = await prisma.vaga.findUnique({
        where: { id: vacancyId },
    });

    if (!vacancy) {
        return <RankingPageContent state="not_found" />;
    }

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
            vacancy={{ cargo: vacancy.cargo }}
            candidates={candidatesWithApp}
            vacancyId={vacancyId}
        />
    );
}
