import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CompanyHero, CompanyKPI, ProfileCompletion, RecentVacancies, RecentCandidates } from '@/src/app/(pages)/company/(companyApp)/dashboard/_components';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/pages/auth/login");
    }

    const companyData = await prisma.empresa.findUnique({
        where: {
            usuario_id: userId,
        },
        select: {
            id: true,
            nome_empresa: true,
            foto_perfil: true,
            cidade: true,
            estado: true,
            pais: true,
            descricao: true,
            telefone: true,
        },
    });

    if (!companyData) {
        redirect("/pages/auth/login");
    }

    // Buscar KPIs
    const companyId = companyData.id;

    const companyVacancies = await prisma.vaga.findMany({
        where: { empresa_id: companyId },
        select: { id: true }
    });
    const vacancyIds = companyVacancies.map(v => v.id);

    const [PublishedVacancies, ReceivedCandidates] = await Promise.all([
        prisma.vaga.count({
            where: { empresa_id: companyId }
        }),
        prisma.vaga_avaliacao.count({
            where: { vaga_id: { in: vacancyIds } }
        }),
    ]);

    // Buscar os status mais recentes das vagas para filtrar as abertas
    const latestStatuses = await prisma.vaga_status.findMany({
        where: { vaga_id: { in: vacancyIds } },
        orderBy: { criado_em: 'desc' }
    });

    const closedVagaIds = new Set<string>();
    const processedVagas = new Set<string>();

    latestStatuses.forEach(status => {
        if (!processedVagas.has(status.vaga_id)) {
            processedVagas.add(status.vaga_id);
            if (['INATIVA', 'FECHADA', 'ENCERRADA'].includes(status.situacao.toUpperCase())) {
                closedVagaIds.add(status.vaga_id);
            }
        }
    });

    const OpenVacancies = vacancyIds.filter(id => !closedVagaIds.has(id)).length;

    const heroData = {
        nomeEmpresa: companyData.nome_empresa,
        fotoPerfil: companyData.foto_perfil || undefined,
        localidade: [companyData.cidade, companyData.estado, companyData.pais]
            .filter(Boolean)
            .join(", "),
        descricao: companyData.descricao,
    };

    // Buscar vagas recentes sem usar include para evitar erros de relação
    const recentVacanciesRaw = await prisma.vaga.findMany({
        where: { empresa_id: companyId },
        orderBy: { created_at: 'desc' },
        take: 5
    });

    const recentVacancyIds = recentVacanciesRaw.map(v => v.id);

    // Fetch Candidate Counts for recent vacancies
    const candidateCounts = await prisma.vaga_avaliacao.groupBy({
        by: ['vaga_id'],
        where: { vaga_id: { in: recentVacancyIds } },
        _count: {
            vaga_id: true
        }
    });

    const candidateCountMap = new Map(candidateCounts.map(c => [c.vaga_id, c._count.vaga_id]));

    // Fetch Latest Statuses for recent vacancies
    // We could reuse 'latestStatuses' but that might contain stale data if we fetched all? 
    // Actually 'latestStatuses' fetched *all* statuses for *all* vacancies of the company.
    // So we can reuse 'latestStatuses' to find status for recent vacancies.
    // We already processed it into a map sort of (processedVagas set).
    // Let's create a map from latestStatuses directly.

    const statusMap = new Map<string, string>();
    const processedStatusVagas = new Set<string>();

    // latestStatuses is already ordered by date desc
    latestStatuses.forEach(status => {
        if (!processedStatusVagas.has(status.vaga_id)) {
            processedStatusVagas.add(status.vaga_id);
            statusMap.set(status.vaga_id, status.situacao);
        }
    });

    const recentVacancies = recentVacanciesRaw.map(v => {
        const status = statusMap.get(v.id);
        // Treat anything that matches Inativa/Fechada (legacy) as Inactiv
        const isInactive = ['INATIVA', 'FECHADA', 'ENCERRADA'].includes(status?.toUpperCase() || '');

        return {
            id: v.id,
            uuid: v.uuid || v.id,
            title: v.cargo,
            date: v.created_at,
            candidatesCount: candidateCountMap.get(v.id) || 0,
            status: isInactive ? 'Inativa' : 'Ativa'
        };
    });

    // Buscar Candidatos Recentes (Aplicações)
    const recentApplicationsRaw = await prisma.vaga_avaliacao.findMany({
        where: {
            vaga_id: { in: vacancyIds }
        },
        orderBy: { created_at: 'desc' },
        take: 5
    });

    // Buscar detalhes dos candidatos e vagas para as aplicações
    const appCandidateIds = recentApplicationsRaw.map(a => a.candidato_id);
    const appVacancyIds = recentApplicationsRaw.map(a => a.vaga_id);

    // Fetch Candidates and Vacancies manually since relations might be missing/partial
    const [appCandidates, appVacancies] = await Promise.all([
        prisma.candidato.findMany({
            where: { id: { in: appCandidateIds } },
            select: {
                id: true,
                nome: true,
                sobrenome: true,
                foto_perfil: true,
                usuario: {
                    select: { avatarUrl: true }
                }
            }
        }),
        prisma.vaga.findMany({
            where: { id: { in: appVacancyIds } },
            select: { id: true, cargo: true }
        })
    ]);

    const appCandidateMap = new Map(appCandidates.map(c => [c.id, c]));
    const appVacancyMap = new Map(appVacancies.map(v => [v.id, v]));

    const applications = recentApplicationsRaw.map(app => {
        const candidate = appCandidateMap.get(app.candidato_id);
        const vacancy = appVacancyMap.get(app.vaga_id);

        return {
            id: app.id,
            candidateName: candidate ? `${candidate.nome || ''} ${candidate.sobrenome || ''}`.trim() || 'Candidato' : 'Candidato Desconhecido',
            candidatePhoto: candidate?.foto_perfil || candidate?.usuario?.avatarUrl,
            vacancyTitle: vacancy?.cargo || 'Vaga Desconhecida',
            date: app.created_at,
            score: app.score,
            candidateId: app.candidato_id
        };
    });

    return (
        <>
            <div className="mb-4 sm:mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-500">Gerencie suas vagas, acompanhe candidatos e encontre talentos alinhados às necessidades da sua empresa.</p>
            </div>
            <CompanyHero companyData={heroData} />
            <ProfileCompletion company={companyData} />
            <CompanyKPI
                PublishedVacancies={PublishedVacancies}
                ReceivedCandidates={ReceivedCandidates}
                OpenVacancies={OpenVacancies}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentVacancies vacancies={recentVacancies} />
                <RecentCandidates applications={applications} />
            </div>

        </>
    )
}