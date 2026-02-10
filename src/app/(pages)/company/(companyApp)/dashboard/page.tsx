import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CompanyHero, CompanyKPI, ProfileCompletion, RecentVacancies, RecentCandidates, DashboardHeader, VideoEvaluations } from '@/src/app/(pages)/company/(companyApp)/dashboard/_components';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
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
        redirect("/login");
    }

    // Buscar KPIs
    const companyId = companyData.id;

    const companyVacancies = await prisma.vaga.findMany({
        where: { empresa_id: companyId },
        select: { id: true }
    });
    const vacancyIds = companyVacancies.map((v: { id: string }) => v.id);

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

    latestStatuses.forEach((status: { vaga_id: string; situacao: string }) => {
        if (!processedVagas.has(status.vaga_id)) {
            processedVagas.add(status.vaga_id);
            if (['INATIVA', 'FECHADA', 'ENCERRADA'].includes(status.situacao.toUpperCase())) {
                closedVagaIds.add(status.vaga_id);
            }
        }
    });

    const OpenVacancies = vacancyIds.filter((id: string) => !closedVagaIds.has(id)).length;

    const heroData = {
        nomeEmpresa: companyData.nome_empresa,
        fotoPerfil: companyData.foto_perfil || undefined,
        localidade: [companyData.cidade, companyData.estado, companyData.pais]
            .filter(Boolean)
            .join(", "),
        descricao: companyData.descricao || undefined,
    };

    // Buscar vagas recentes sem usar include para evitar erros de relação
    const recentVacanciesRaw = await prisma.vaga.findMany({
        where: { empresa_id: companyId },
        orderBy: { created_at: 'desc' },
        take: 5
    });

    const recentVacancyIds = recentVacanciesRaw.map((v: { id: string }) => v.id);

    // Fetch Candidate Counts for recent vacancies
    const candidateCounts = await prisma.vaga_avaliacao.groupBy({
        by: ['vaga_id'],
        where: { vaga_id: { in: recentVacancyIds } },
        _count: {
            vaga_id: true
        }
    });

    const candidateCountMap = new Map(candidateCounts.map((c: { vaga_id: string; _count: { vaga_id: number } }) => [c.vaga_id, c._count.vaga_id]));

    const statusMap = new Map<string, string>();
    const processedStatusVagas = new Set<string>();

    // latestStatuses is already ordered by date desc
    latestStatuses.forEach((status: { vaga_id: string; situacao: string }) => {
        if (!processedStatusVagas.has(status.vaga_id)) {
            processedStatusVagas.add(status.vaga_id);
            statusMap.set(status.vaga_id, status.situacao);
        }
    });

    const recentVacancies = recentVacanciesRaw.map((v: any) => {
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
        take: 5,
        select: {
            id: true,
            candidato_id: true,
            vaga_id: true,
            created_at: true,
            score: true,
            breakdown: true
        }
    });

    // Buscar detalhes dos candidatos e vagas para as aplicações
    const appCandidateIds = recentApplicationsRaw.map((a: { candidato_id: string }) => a.candidato_id);
    const appVacancyIds = recentApplicationsRaw.map((a: { vaga_id: string }) => a.vaga_id);

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
            select: { id: true, cargo: true, uuid: true }
        })
    ]);

    const appCandidateMap = new Map(appCandidates.map((c: any) => [c.id, c]));
    const appVacancyMap = new Map(appVacancies.map((v: any) => [v.id, v]));

    const applications = recentApplicationsRaw.map((app: any) => {
        const candidate: any = appCandidateMap.get(app.candidato_id);
        const vacancy: any = appVacancyMap.get(app.vaga_id);

        // Parse breakdown para obter status do vídeo
        let videoStatus = null;
        try {
            if (app.breakdown) {
                const breakdown = JSON.parse(app.breakdown);
                videoStatus = breakdown?.video?.status || null;
            }
        } catch (e) {
        }

        return {
            id: app.id,
            candidateName: candidate ? `${candidate.nome || ''} ${candidate.sobrenome || ''}`.trim() || 'Candidato' : 'Candidato Desconhecido',
            candidatePhoto: candidate?.foto_perfil || candidate?.usuario?.avatarUrl,
            vacancyTitle: vacancy?.cargo || 'Vaga Desconhecida',
            date: app.created_at,
            score: app.score,
            candidateId: app.candidato_id,
            vacancyId: vacancy?.uuid || app.vaga_id,
            videoStatus
        };
    });

    // Buscar avaliações de vídeo pendentes
    const pendingVideoEvaluationsRaw = await prisma.vaga_avaliacao.findMany({
        where: {
            vaga_id: { in: vacancyIds },
            breakdown: {
                contains: '"status":"submitted"'
            }
        },
        select: {
            id: true,
            vaga_id: true,
            candidato_id: true,
            breakdown: true
        }
    });

    const pendingVacancyIds = pendingVideoEvaluationsRaw.map((p: { vaga_id: string }) => p.vaga_id);
    const pendingCandidateIds = pendingVideoEvaluationsRaw.map((p: { candidato_id: string }) => p.candidato_id);

    const [pendingVacancies, pendingCandidates] = await Promise.all([
        prisma.vaga.findMany({
            where: { id: { in: pendingVacancyIds } },
            select: { id: true, uuid: true, cargo: true }
        }),
        prisma.candidato.findMany({
            where: { id: { in: pendingCandidateIds } },
            select: {
                id: true,
                uuid: true,
                nome: true,
                sobrenome: true,
                foto_perfil: true,
                usuario: {
                    select: { avatarUrl: true }
                }
            }
        })
    ]);

    const pendingVacancyMap = new Map(pendingVacancies.map((v: any) => [v.id, v]));
    const pendingCandidateMap = new Map(pendingCandidates.map((c: any) => [c.id, c]));

    const videoEvaluations = pendingVideoEvaluationsRaw
        .map((app: any) => {
            try {
                if (!app.breakdown) return null;
                const breakdown = typeof app.breakdown === 'string' ? JSON.parse(app.breakdown) : app.breakdown;

                const hasVideo = breakdown.video?.status === 'submitted';
                const hasFeedback = breakdown.feedback?.status;

                if (hasVideo && !hasFeedback) {
                    const vaga = pendingVacancyMap.get(app.vaga_id);
                    const candidato = pendingCandidateMap.get(app.candidato_id);

                    if (!vaga || !candidato) return null;

                    return {
                        id: app.id,
                        vacancyUuid: vaga.uuid,
                        cargo: vaga.cargo,
                        candidato: {
                            id: candidato.id,
                            uuid: candidato.uuid,
                            nome: candidato.nome || '',
                            sobrenome: candidato.sobrenome || '',
                            foto_perfil: candidato.foto_perfil,
                            avatarUrl: candidato.usuario?.avatarUrl
                        },
                        submittedAt: breakdown.video.submittedAt,
                        aiSuggestions: breakdown.suggestions
                    };
                }
                return null;
            } catch (e) {
                return null;
            }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    return (
        <>
            <DashboardHeader />
            <CompanyHero companyData={heroData} />
            <ProfileCompletion company={companyData} />
            <VideoEvaluations evaluations={videoEvaluations} />
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