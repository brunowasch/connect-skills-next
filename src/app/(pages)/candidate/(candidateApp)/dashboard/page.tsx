import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { Hero, KPI, RecommendedVacancies, ApplicationHistory, ProfileCompletion, DashboardHeader } from "@/src/app/(pages)/candidate/(candidateApp)/dashboard/_components/index";

export default async function Dashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/pages/auth/login");
    }

    // Buscar dados do candidato com áreas de interesse
    const candidateComplete = await prisma.candidato.findUnique({
        where: {
            usuario_id: userId,
        },
        select: {
            id: true,
            nome: true,
            sobrenome: true,
            foto_perfil: true,
            pais: true,
            estado: true,
            cidade: true,
            descricao: true,
            telefone: true,
            data_nascimento: true,
            candidato_area: {
                select: {
                    area_interesse: {
                        select: {
                            id: true,
                            nome: true,
                        }
                    }
                }
            }
        },
    });

    if (!candidateComplete) {
        redirect("/pages/auth/login");
    }

    // Extrair dados do candidato para o Hero
    const candidate = {
        nome: candidateComplete.nome,
        sobrenome: candidateComplete.sobrenome,
        foto_perfil: candidateComplete.foto_perfil,
        pais: candidateComplete.pais,
        estado: candidateComplete.estado,
        cidade: candidateComplete.cidade,
        descricao: candidateComplete.descricao,
        telefone: candidateComplete.telefone,
        data_nascimento: candidateComplete.data_nascimento,
    };

    // Extrair áreas de interesse
    const areasIds = candidateComplete.candidato_area.map(ca => ca.area_interesse.id);
    const areas = candidateComplete.candidato_area
        .map(ca => ca.area_interesse.nome)
        .filter(Boolean) as string[];

    // Buscar vagas aplicadas PRIMEIRO (para excluir das recomendações)
    const appliedVacanciesData = await prisma.vaga_avaliacao.findMany({
        where: {
            candidato_id: candidateComplete.id
        },
        select: {
            vaga_id: true,
            created_at: true,
        }
    });

    const appliedVacanciesIds = appliedVacanciesData.map(av => av.vaga_id);
    const appliedVacanciesCount = appliedVacanciesData.length;

    // Buscar vagas recomendadas (baseadas nas áreas de interesse)
    let recommendedVacanciesCount = 0;
    let recommendedVacancies: any[] = [];
    if (areasIds.length > 0) {
        // Primeiro, buscar os IDs únicos das vagas recomendadas
        const vagasIds = await prisma.vaga_area.findMany({
            where: {
                area_interesse_id: {
                    in: areasIds
                }
            },
            select: {
                vaga_id: true
            }
        });

        // Garantir que contamos apenas IDs únicos E que NÃO foram aplicadas
        const uniqueVagaIds = [...new Set(vagasIds.map(v => v.vaga_id))]
            .filter(vagaId => !appliedVacanciesIds.includes(vagaId));

        // Contar quantas dessas vagas realmente existem na tabela vaga
        if (uniqueVagaIds.length > 0) {
            recommendedVacanciesCount = await prisma.vaga.count({
                where: {
                    id: {
                        in: uniqueVagaIds
                    }
                }
            });
        }

        // Buscar os dados completos das vagas (limitado a 3)
        if (uniqueVagaIds.length > 0) {
            const vagas = await prisma.vaga.findMany({
                where: {
                    id: {
                        in: uniqueVagaIds
                    }
                },
                select: {
                    id: true,
                    uuid: true,
                    cargo: true,
                    tipo_local_trabalho: true,
                    salario: true,
                    moeda: true,
                    empresa_id: true,
                },
                take: 3 // Limitar a 3 vagas já que o componente só mostra 3
            });

            // Buscar dados das empresas
            const empresaIds = [...new Set(vagas.map(v => v.empresa_id))];
            const empresas = await prisma.empresa.findMany({
                where: {
                    id: {
                        in: empresaIds
                    }
                },
                select: {
                    id: true,
                    nome_empresa: true,
                    foto_perfil: true,
                    cidade: true,
                    estado: true,
                    pais: true,
                }
            });

            // Buscar áreas das vagas
            const vagaAreas = await prisma.vaga_area.findMany({
                where: {
                    vaga_id: {
                        in: vagas.map(v => v.id)
                    }
                },
                select: {
                    vaga_id: true,
                    area_interesse_id: true,
                }
            });

            // Buscar nomes das áreas
            const areaIds = [...new Set(vagaAreas.map(va => va.area_interesse_id))];
            const areasInteresse = await prisma.area_interesse.findMany({
                where: {
                    id: {
                        in: areaIds
                    }
                },
                select: {
                    id: true,
                    nome: true,
                }
            });

            // Montar os dados completos das vagas
            recommendedVacancies = vagas.map(vaga => {
                const empresa = empresas.find(e => e.id === vaga.empresa_id);
                const vagaAreasData = vagaAreas
                    .filter(va => va.vaga_id === vaga.id)
                    .map(va => {
                        const area = areasInteresse.find(a => a.id === va.area_interesse_id);
                        return {
                            area_interesse: {
                                nome: area?.nome || ''
                            }
                        };
                    });

                return {
                    id: vaga.id,
                    uuid: vaga.uuid,
                    cargo: vaga.cargo,
                    tipo_local_trabalho: vaga.tipo_local_trabalho,
                    salario: vaga.salario ? Number(vaga.salario) : undefined,
                    moeda: vaga.moeda,
                    empresa: empresa ? {
                        id: empresa.id,
                        nome_empresa: empresa.nome_empresa,
                        foto_perfil: empresa.foto_perfil,
                        cidade: empresa.cidade,
                        estado: empresa.estado,
                        pais: empresa.pais,
                    } : undefined,
                    vaga_area: vagaAreasData
                };
            });
        }
    }

    // Buscar dados completos das vagas aplicadas
    let appliedVacancies: any[] = [];
    if (appliedVacanciesData.length > 0) {
        const appliedVagasIds = appliedVacanciesData.map(av => av.vaga_id);

        const appliedVagas = await prisma.vaga.findMany({
            where: {
                id: {
                    in: appliedVagasIds
                }
            },
            select: {
                id: true,
                uuid: true,
                cargo: true,
                tipo_local_trabalho: true,
                salario: true,
                moeda: true,
                empresa_id: true,
            }
        });

        // Buscar dados das empresas
        const appliedEmpresaIds = [...new Set(appliedVagas.map(v => v.empresa_id))];
        const appliedEmpresas = await prisma.empresa.findMany({
            where: {
                id: {
                    in: appliedEmpresaIds
                }
            },
            select: {
                id: true,
                nome_empresa: true,
                foto_perfil: true,
                cidade: true,
                estado: true,
                pais: true,
            }
        });

        // Buscar áreas das vagas aplicadas
        const appliedVagaAreas = await prisma.vaga_area.findMany({
            where: {
                vaga_id: {
                    in: appliedVagasIds
                }
            },
            select: {
                vaga_id: true,
                area_interesse_id: true,
            }
        });

        // Buscar nomes das áreas
        const appliedAreaIds = [...new Set(appliedVagaAreas.map(va => va.area_interesse_id))];
        const appliedAreasInteresse = await prisma.area_interesse.findMany({
            where: {
                id: {
                    in: appliedAreaIds
                }
            },
            select: {
                id: true,
                nome: true,
            }
        });

        // Montar os dados completos das vagas aplicadas
        appliedVacancies = appliedVagas.map(vaga => {
            const empresa = appliedEmpresas.find(e => e.id === vaga.empresa_id);
            const vagaAreasData = appliedVagaAreas
                .filter(va => va.vaga_id === vaga.id)
                .map(va => {
                    const area = appliedAreasInteresse.find(a => a.id === va.area_interesse_id);
                    return {
                        area_interesse: {
                            nome: area?.nome || ''
                        }
                    };
                });

            const applicationData = appliedVacanciesData.find(av => av.vaga_id === vaga.id);

            return {
                id: vaga.id,
                uuid: vaga.uuid,
                cargo: vaga.cargo,
                tipo_local_trabalho: vaga.tipo_local_trabalho,
                salario: vaga.salario ? Number(vaga.salario) : undefined,
                moeda: vaga.moeda,
                empresa: empresa ? {
                    id: empresa.id,
                    nome_empresa: empresa.nome_empresa,
                    foto_perfil: empresa.foto_perfil,
                    cidade: empresa.cidade,
                    estado: empresa.estado,
                    pais: empresa.pais,
                } : undefined,
                vaga_area: vagaAreasData,
                created_at: applicationData?.created_at,
            };
        });
    }

    return (
        <>
            <DashboardHeader />
            <Hero candidato={candidate} />
            <ProfileCompletion candidato={candidate} usuario={userId} areas={areas} />
            <KPI
                recommendedVacanciesCount={recommendedVacanciesCount}
                appliedVacanciesCount={appliedVacanciesCount}
                areas={areas}
            />
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <RecommendedVacancies vacanciesRecommended={recommendedVacancies} />
                <ApplicationHistory historicoAplicacoes={appliedVacancies} />
            </div>
        </>
    );
}   