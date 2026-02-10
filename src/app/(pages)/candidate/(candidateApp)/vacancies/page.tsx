import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { VacanciesClientContent } from "./_components/VacanciesClientContent";
import { Vacancy } from "@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy";

async function getVacancies(searchParams?: { q?: string; loc?: string; type?: string; all?: string; tab?: string }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        return { vagas: [], areas: [], count: 0, isSearch: false, isAll: false, isFavorites: false, isHistory: false, allFavoritesCount: 0, appliedCount: 0 };
    }

    const isFavorites = searchParams?.tab?.toLowerCase() === 'favorites';
    const isHistory = searchParams?.tab?.toLowerCase() === 'history';

    // Buscar dados do candidato para áreas e FAVORITOS (sempre necessário para o contexto)
    const candidateComplete = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        select: {
            id: true,
            cidade: true,
            estado: true,
            pais: true,
            candidato_area: {
                select: {
                    area_interesse: {
                        select: { id: true, nome: true }
                    }
                }
            },
            vaga_favorita: {
                select: { vaga_id: true }
            }
        },
    });

    if (!candidateComplete) {
        return { vagas: [], areas: [], count: 0, isSearch: false, isAll: false, isFavorites, isHistory, allFavoritesCount: 0, appliedCount: 0 };
    }

    const dbFavoriteIds = candidateComplete.vaga_favorita.map((f: any) => f.vaga_id) || [];
    const favoriteIds = dbFavoriteIds;

    const areasIds = candidateComplete.candidato_area.map((ca: any) => ca.area_interesse.id);
    const areas = candidateComplete.candidato_area
        .map((ca: any) => ca.area_interesse.nome)
        .filter(Boolean) as string[];

    // Buscar vagas já aplicadas pelo candidato
    const appliedVacancies = await prisma.vaga_avaliacao.findMany({
        where: { candidato_id: candidateComplete.id },
        select: { 
            vaga_id: true,
            breakdown: true,
            created_at: true
        }
    });
    const appliedVacanciesIds = appliedVacancies.map(av => av.vaga_id);

    let vacancies: Vacancy[] = [];
    const isSearch = !!(searchParams?.q || searchParams?.loc || searchParams?.type);
    const isAll = searchParams?.all === 'true';

    let whereClause: any = {};

    // 1. Determinar o conjunto BASE de IDs (Favoritos, Recomendadas, Todas ou Histórico)
    if (isHistory) {
        if (appliedVacanciesIds.length === 0) {
            return { vagas: [], areas, count: 0, isSearch, isAll, isFavorites, isHistory: true, allFavoritesCount: favoriteIds.length, appliedCount: 0 };
        }
        whereClause.id = { in: appliedVacanciesIds };
    } else if (isFavorites) {
        if (favoriteIds.length === 0) {
            return { vagas: [], areas, count: 0, isSearch, isAll, isFavorites: true, isHistory, allFavoritesCount: 0, appliedCount: appliedVacanciesIds.length };
        }
        whereClause.id = { in: favoriteIds };
    } else if (!isAll) {
        // Modo Recomendadas: filtrado por área e que não foram aplicadas
        if (areasIds.length === 0) {
            return { vagas: [], areas, count: 0, isSearch, isAll: false, isFavorites: false, isHistory, allFavoritesCount: favoriteIds.length, appliedCount: appliedVacanciesIds.length };
        }

        const vagasAreas = await prisma.vaga_area.findMany({
            where: { area_interesse_id: { in: areasIds } },
            select: { vaga_id: true }
        });

        const uniqueVagaIds = [...new Set(vagasAreas.map(v => v.vaga_id))]
            .filter(vagaId => !appliedVacanciesIds.includes(vagaId));

        if (uniqueVagaIds.length === 0) {
            return { vagas: [], areas, count: 0, isSearch, isAll: false, isFavorites: false, isHistory, allFavoritesCount: favoriteIds.length, appliedCount: appliedVacanciesIds.length };
        }

        whereClause.id = { in: uniqueVagaIds };
    } else {
        // Modo Global: excluímos apenas as já aplicadas
        whereClause.id = { notIn: appliedVacanciesIds };
    }

    // 2. Aplicar FILTROS ADICIONAIS (Search) sobre o conjunto base
    if (isSearch) {
        const andFilters: any[] = [];

        // Filtro por termo de busca (Cargo, Descrição, Empresa, Áreas)
        if (searchParams?.q) {
            const terms = searchParams.q.split(' ').filter(word => word.length > 1);

            for (const term of terms) {
                const companies = await prisma.empresa.findMany({
                    where: { nome_empresa: { contains: term } },
                    select: { id: true }
                });
                const companyIds = companies.map(c => c.id);

                const matchingAreas = await prisma.area_interesse.findMany({
                    where: { nome: { contains: term } },
                    select: { id: true }
                });
                const areaIdsFromTerm = matchingAreas.map(a => a.id);

                let vagaIdsFromSearchTermArea: string[] = [];
                if (areaIdsFromTerm.length > 0) {
                    const vagasWithArea = await prisma.vaga_area.findMany({
                        where: { area_interesse_id: { in: areaIdsFromTerm } },
                        select: { vaga_id: true }
                    });
                    vagaIdsFromSearchTermArea = vagasWithArea.map(v => v.vaga_id);
                }

                andFilters.push({
                    OR: [
                        { cargo: { contains: term } },
                        { descricao: { contains: term } },
                        { empresa_id: { in: companyIds } },
                        { id: { in: vagaIdsFromSearchTermArea } }
                    ]
                });
            }
        }

        // Filtro por localização
        if (searchParams?.loc) {
            const companiesLoc = await prisma.empresa.findMany({
                where: {
                    OR: [
                        { cidade: { contains: searchParams.loc } },
                        { estado: { contains: searchParams.loc } }
                    ]
                },
                select: { id: true }
            });
            const companyIdsLoc = companiesLoc.map(c => c.id);

            andFilters.push({
                empresa_id: { in: companyIdsLoc }
            });
        }

        // Filtro por tipo
        if (searchParams?.type) {
            andFilters.push({
                tipo_local_trabalho: searchParams.type
            });
        }

        if (andFilters.length > 0) {
            whereClause.AND = andFilters;
        }
    }

    // Executar query principal
    let vagasLocalizadas = await prisma.vaga.findMany({
        where: whereClause,
        select: {
            id: true,
            uuid: true,
            cargo: true,
            tipo_local_trabalho: true,
            salario: true,
            moeda: true,
            empresa_id: true,
            descricao: true,
            created_at: true,
            vinculo_empregaticio: true,
            opcao: true,
        },
        orderBy: { created_at: 'desc' },
        take: 50
    });

    // Se a busca com localização não retornou nada, mas tínhamos um termo de busca 'q',
    // tentamos buscar novamente ignorando a localização para não deixar o usuário sem resultados.
    if (!isFavorites && !isHistory && vagasLocalizadas.length === 0 && searchParams?.loc && searchParams?.q) {
        // Remover filtro de localização (empresa_id baseado em cidade/estado)
        const refinedWhere = { ...whereClause };
        if (refinedWhere.AND) {
            // Filtramos o array AND para remover qualquer restrição baseada em empresa_id vinda do loc
            refinedWhere.AND = refinedWhere.AND.filter((cond: any) => !cond.empresa_id);
        }

        vagasLocalizadas = await prisma.vaga.findMany({
            where: refinedWhere,
            select: {
                id: true,
                uuid: true,
                cargo: true,
                tipo_local_trabalho: true,
                salario: true,
                moeda: true,
                empresa_id: true,
                descricao: true,
                created_at: true,
                vinculo_empregaticio: true,
                opcao: true,
            },
            orderBy: { created_at: 'desc' },
            take: 50
        });
    }

    // Filtrar vagas inativas para as visualizações de Explorar e Recomendadas
    if (!isHistory && !isFavorites) {
        const vagaIdsToCheck = vagasLocalizadas.map(v => v.id);
        
        if (vagaIdsToCheck.length > 0) {
            const statuses = await prisma.vaga_status.findMany({
                where: { vaga_id: { in: vagaIdsToCheck } },
                orderBy: { criado_em: 'desc' }
            });

            const latestStatusMap = new Map<string, string>();
            for (const s of statuses) {
                if (!latestStatusMap.has(s.vaga_id)) {
                    latestStatusMap.set(s.vaga_id, s.situacao);
                }
            }

            vagasLocalizadas = vagasLocalizadas.filter(v => {
                const status = latestStatusMap.get(v.id);
                return status === 'Ativa';
            });
        }
    }

    const vagas = vagasLocalizadas;

    if (vagas.length > 0) {
        const empresaIds = [...new Set(vagas.map(v => v.empresa_id))];
        const empresas = await prisma.empresa.findMany({
            where: { id: { in: empresaIds } },
            select: {
                id: true, nome_empresa: true, foto_perfil: true,
                cidade: true, estado: true, pais: true
            }
        });

        const vagaAreas = await prisma.vaga_area.findMany({
            where: { vaga_id: { in: vagas.map(v => v.id) } },
            select: {
                vaga_id: true, area_interesse_id: true,
            }
        });

        const areaIds = [...new Set(vagaAreas.map(va => va.area_interesse_id))];
        const areasInteresse = await prisma.area_interesse.findMany({
            where: { id: { in: areaIds } },
            select: { id: true, nome: true }
        });

        // Mapear para o tipo Vacancy e Calcular Relevância de Localização
        vacancies = vagas.map(vaga => {
            const empresa = empresas.find(e => e.id === vaga.empresa_id);
            const areasData = vagaAreas
                .filter(va => va.vaga_id === vaga.id)
                .map(va => {
                    const areaInfo = areasInteresse.find(ai => ai.id === va.area_interesse_id);
                    return {
                        area_interesse: { nome: areaInfo?.nome || '' }
                    };
                });

            // Lógica de Scoring para ordenação:
            // 1. Cidade igual: 100 pontos
            // 2. Estado igual: 50 pontos
            // 3. País igual: 10 pontos
            // 4. Outra localização: 5 pontos
            // 5. Sem localização: 0 pontos
            let score = 0;
            const hasLocation = empresa?.cidade || empresa?.estado || empresa?.pais;

            if (hasLocation) {
                if (empresa?.cidade?.toLowerCase() === candidateComplete.cidade?.toLowerCase()) score += 100;
                else if (empresa?.estado?.toLowerCase() === candidateComplete.estado?.toLowerCase()) score += 50;
                else if (empresa?.pais?.toLowerCase() === candidateComplete.pais?.toLowerCase()) score += 10;
                else score += 5; // Outra localização qualquer
            } else {
                score = 0; // Sem localização nenhuma
            }

            // Extrair feedbackStatus e videoStatus do breakdown (se estiver no histórico)
            let feedbackStatus = null;
            let videoStatus = null;
            if (isHistory) {
                const applicationData = appliedVacancies.find(av => av.vaga_id === vaga.id);
                if (applicationData?.breakdown) {
                    try {
                        const breakdown = typeof applicationData.breakdown === 'string' 
                            ? JSON.parse(applicationData.breakdown) 
                            : applicationData.breakdown;
                        feedbackStatus = breakdown?.feedback?.status || null;
                        videoStatus = breakdown?.video?.status || null;
                    } catch (e) {
                        console.error("Error parsing breakdown", e);
                    }
                }
            }

            return {
                id: vaga.id,
                uuid: vaga.uuid,
                cargo: vaga.cargo,
                tipo_local_trabalho: vaga.tipo_local_trabalho as Vacancy['tipo_local_trabalho'],
                salario: vaga.salario ? Number(vaga.salario) : undefined,
                moeda: vaga.moeda || 'BRL',
                empresa: empresa ? {
                    id: empresa.id,
                    nome_empresa: empresa.nome_empresa,
                    foto_perfil: empresa.foto_perfil || undefined,
                    cidade: empresa.cidade || undefined,
                    estado: empresa.estado || undefined,
                    pais: empresa.pais || undefined,
                } : undefined,
                vaga_area: areasData,
                descricao: vaga.descricao,
                opcao: vaga.opcao,
                created_at: vaga.created_at.toISOString(),
                vinculo_empregaticio: vaga.vinculo_empregaticio || undefined,
                // Adicionamos flags extras para o componente
                score,
                isNear: score >= 50, // Destaque para mesma cidade ou estado
                isFavorited: favoriteIds.includes(vaga.id),
                feedbackStatus,
                videoStatus
            } as any;
        });

        // Ordenar: Primeiro por score (localização), depois por data de criação
        vacancies.sort((a: any, b: any) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }

    return { vagas: vacancies, areas, count: vacancies.length, isSearch, isAll, isFavorites, isHistory, allFavoritesCount: favoriteIds.length, appliedCount: appliedVacanciesIds.length };
}

export default async function VacanciesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const { vagas, areas, count, isSearch, isAll, isFavorites, isHistory, allFavoritesCount, appliedCount } = await getVacancies(params);

    return (
        <VacanciesClientContent
            vagas={vagas as any}
            areas={areas}
            count={count}
            isSearch={isSearch}
            isAll={isAll}
            isFavorites={isFavorites}
            isHistory={isHistory}
            allFavoritesCount={allFavoritesCount}
            appliedCount={appliedCount}
        />
    );
}
