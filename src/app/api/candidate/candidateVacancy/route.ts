import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Usuário não autenticado" },
                { status: 401 }
            );
        }

        // Buscar o candidato pelo usuario_id
        const candidato = await prisma.candidato.findUnique({
            where: { usuario_id: userId },
            select: {
                id: true,
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
            }
        });

        if (!candidato) {
            return NextResponse.json(
                { error: "Candidato não encontrado" },
                { status: 404 }
            );
        }

        // Extrair IDs das áreas de interesse do candidato
        const areasIds = candidato.candidato_area.map(ca => ca.area_interesse.id);
        const areasNames = candidato.candidato_area.map(ca => ca.area_interesse.nome).filter(Boolean) as string[];

        // Contar vagas recomendadas (vagas que correspondem às áreas de interesse do candidato)
        let recommendedVacanciesCount = 0;
        if (areasIds.length > 0) {
            const recommendedVacancies = await prisma.vaga_area.findMany({
                where: {
                    area_interesse_id: {
                        in: areasIds
                    }
                },
                select: {
                    vaga_id: true
                },
                distinct: ['vaga_id']
            });
            recommendedVacanciesCount = recommendedVacancies.length;
        }

        // Contar vagas aplicadas pelo candidato
        const appliedVacanciesCount = await prisma.vaga_avaliacao.count({
            where: {
                candidato_id: candidato.id
            }
        });

        return NextResponse.json({
            recommendedVacanciesCount,
            appliedVacanciesCount,
            areas: areasNames,
        });

    } catch (error) {
        console.error("Erro ao buscar vagas do candidato:", error);
        return NextResponse.json(
            { error: "Erro ao buscar vagas do candidato" },
            { status: 500 }
        );
    }
}