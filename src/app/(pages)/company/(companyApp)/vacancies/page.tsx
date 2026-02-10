import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { VacanciesList } from "./_components/VacanciesList";
import { redirect } from "next/navigation";

export default async function VacanciesPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect('/login');
    }

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
    });

    if (!company) {
        redirect('/');
    }

    const vacancies = await prisma.vaga.findMany({
        where: { empresa_id: company.id },
        select: {
            id: true,
            uuid: true,
            cargo: true,
            tipo_local_trabalho: true,
            escala_trabalho: true,
            created_at: true,
            empresa_id: true,
        },
        orderBy: { created_at: 'desc' },
    });

    const vacancyIds = vacancies.map(v => v.id);

    const evaluations = await prisma.vaga_avaliacao.findMany({
        where: {
            vaga_id: { in: vacancyIds }
        },
        select: {
            vaga_id: true,
            breakdown: true
        }
    });

    const statsMap = new Map<string, { total: number, pendingVideo: number, noVideo: number, feedbackGiven: number }>();

    // Initialize map
    vacancyIds.forEach(id => {
        statsMap.set(id, { total: 0, pendingVideo: 0, noVideo: 0, feedbackGiven: 0 });
    });

    // Calculate stats
    evaluations.forEach(ev => {
        const stats = statsMap.get(ev.vaga_id);
        if (stats) {
            stats.total++;

            let breakdown: any = {};
            try {
                if (ev.breakdown && typeof ev.breakdown === 'string') {
                    breakdown = JSON.parse(ev.breakdown);
                } else if (ev.breakdown && typeof ev.breakdown === 'object') {
                    breakdown = ev.breakdown;
                }
            } catch (e) {
                // If JSON parse fails, treat as no video
            }

            const videoStatus = breakdown?.video?.status;
            const feedbackStatus = breakdown?.feedback?.status;

            if (feedbackStatus) {
                stats.feedbackGiven++;
            } else if (videoStatus === 'submitted') {
                stats.pendingVideo++;
            } else {
                stats.noVideo++; // Not submitted or no breakdown
            }
        }
    });

    const statuses = await prisma.vaga_status.findMany({
        where: { vaga_id: { in: vacancyIds } },
        orderBy: { criado_em: 'desc' }
    });

    const vacanciesWithCounts = vacancies.map(vacancy => {
        const stats = statsMap.get(vacancy.id) || { total: 0, pendingVideo: 0, noVideo: 0, feedbackGiven: 0 };
        const statusRecord = statuses.find(s => s.vaga_id === vacancy.id);
        const rawStatus = statusRecord ? statusRecord.situacao.toUpperCase() : 'ATIVA';
        const status = ['INATIVA', 'FECHADA', 'ENCERRADA'].includes(rawStatus) ? 'inactive' : 'active';

        return {
            ...vacancy,
            uuid: vacancy.uuid || vacancy.id,
            status,
            _count: {
                vaga_avaliacao: stats.total
            },
            stats
        };
    });

    return (
        <VacanciesList initialVacancies={vacanciesWithCounts} />
    );
}