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

    const applicationCounts = await prisma.vaga_avaliacao.groupBy({
        by: ['vaga_id'],
        _count: {
            vaga_id: true
        },
        where: {
            vaga_id: { in: vacancyIds }
        }
    });

    const statuses = await prisma.vaga_status.findMany({
        where: { vaga_id: { in: vacancyIds } },
        orderBy: { criado_em: 'desc' }
    });

    const vacanciesWithCounts = vacancies.map(vacancy => {
        const count = applicationCounts.find(c => c.vaga_id === vacancy.id)?._count.vaga_id || 0;
        const statusRecord = statuses.find(s => s.vaga_id === vacancy.id);
        const rawStatus = statusRecord ? statusRecord.situacao.toUpperCase() : 'ATIVA';
        const status = ['INATIVA', 'FECHADA', 'ENCERRADA'].includes(rawStatus) ? 'inactive' : 'active';

        return {
            ...vacancy,
            status,
            _count: {
                vaga_avaliacao: count
            }
        };
    });

    return (
        <VacanciesList initialVacancies={vacanciesWithCounts} />
    );
}