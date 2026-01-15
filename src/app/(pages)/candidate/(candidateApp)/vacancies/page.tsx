import { VacancyCard } from "./_components/VacancyCard";
import { SearchFilters } from "./_components/SearchFilters";
import { Vacancy } from "@/src/app/(pages)/candidate/(candidateApp)/types/Vacancy";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

async function getVacancies(searchParams?: { q?: string; loc?: string; type?: string }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        return { vagas: [], areas: [], count: 0, isSearch: false };
    }

    // Buscar dados do candidato para áreas (sempre necessário para o contexto)
    const candidateComplete = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        select: {
            id: true,  // Precisamos do ID para buscar as vagas aplicadas
            candidato_area: {
                select: {
                    area_interesse: {
                        select: { id: true, nome: true }
                    }
                }
            }
        },
    });

    if (!candidateComplete) {
        return { vagas: [], areas: [], count: 0, isSearch: false };
    }

    const areasIds = candidateComplete.candidato_area.map(ca => ca.area_interesse.id);
    const areas = candidateComplete.candidato_area
        .map(ca => ca.area_interesse.nome)
        .filter(Boolean) as string[];

    // Buscar vagas já aplicadas pelo candidato
    const appliedVacancies = await prisma.vaga_avaliacao.findMany({
        where: { candidato_id: candidateComplete.id },
        select: { vaga_id: true }
    });
    const appliedVacanciesIds = appliedVacancies.map(av => av.vaga_id);

    let vacancies: Vacancy[] = [];
    const isSearch = !!(searchParams?.q || searchParams?.loc || searchParams?.type);

    // Sempre buscar as vagas compatíveis com as áreas de interesse
    // Isso garante que apenas vagas recomendadas sejam mostradas
    if (areasIds.length === 0) {
        return { vagas: [], areas, count: 0, isSearch };
    }

    const vagasAreas = await prisma.vaga_area.findMany({
        where: { area_interesse_id: { in: areasIds } },
        select: { vaga_id: true }
    });

    // Filtrar vagas únicas E que NÃO foram aplicadas
    const uniqueVagaIds = [...new Set(vagasAreas.map(v => v.vaga_id))]
        .filter(vagaId => !appliedVacanciesIds.includes(vagaId));

    if (uniqueVagaIds.length === 0) {
        return { vagas: [], areas, count: 0, isSearch };
    }

    let whereClause: any = {
        id: { in: uniqueVagaIds }
    };

    // Se houver busca, adicionar filtros adicionais
    if (isSearch) {
        whereClause.AND = [];

        if (searchParams?.q) {
            const companies = await prisma.empresa.findMany({
                where: { nome_empresa: { contains: searchParams.q } },
                select: { id: true }
            });
            const companyIds = companies.map(c => c.id);

            whereClause.AND.push({
                OR: [
                    { cargo: { contains: searchParams.q } },
                    { descricao: { contains: searchParams.q } },
                    { empresa_id: { in: companyIds } }
                ]
            });
        }

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

            whereClause.AND.push({
                empresa_id: { in: companyIdsLoc }
            });
        }

        if (searchParams?.type) {
            whereClause.AND.push({
                tipo_local_trabalho: searchParams.type
            });
        }
    }

    // Executar query principal
    const vagas = await prisma.vaga.findMany({
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

        // Mapear para o tipo Vacancy
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
            };
        });
    }

    return { vagas: vacancies, areas, count: vacancies.length, isSearch };
}

export default async function VacanciesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const { vagas, areas, count, isSearch } = await getVacancies(params);

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Encontrar Vagas</h1>
                <p className="text-gray-500">Explore oportunidades que combinam com o seu perfil.</p>
            </div>

            <SearchFilters />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {isSearch ? 'Resultados da busca' : 'Recomendadas para você'}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {count} encontradas
                </span>
            </div>
            <div className="flex items-center mb-6">
                <p className="text-gray-500">Não encontrou o que esperava?</p>
                <button className="text-blue-500 px-2 font-semibold cursor-pointer hover:underline">Quero procurar novas vagas</button>
            </div>
            {/* Alerta de Áreas (apenas se não for busca e tiver poucas áreas) */}
            {
                !isSearch && areas.length < 1 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-exclamation-triangle-fill text-amber-500 text-xl"></i>
                            <div>
                                <p className="font-semibold text-amber-900">Nenhuma vaga encontrada.</p>
                                <p className="text-sm text-amber-700">Selecione ao menos uma nova área de interesse para encontrar vagas.</p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Grid de Vagas */}
            {
                vagas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">
                            {isSearch
                                ? "Nenhuma vaga encontrada para sua busca."
                                : "Nenhuma vaga recomendada no momento."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vagas.map((vaga) => (
                            <VacancyCard key={vaga.id} vaga={vaga} />
                        ))}
                    </div>
                )
            }
        </main >
    );
}