import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendNewApplicationEmail } from "@/src/lib/mail";
import { randomUUID } from "crypto";

const IA_SUGGEST_URL = process.env.IA_SUGGEST_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { vaga_id, candidato_id, duration, penalties, responses } = body;

        if (!vaga_id || !candidato_id || !responses) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // Buscar detalhes da vaga para contexto da IA
        const vacancy = await prisma.vaga.findUnique({
            where: { id: vaga_id },
            include: {
                vaga_soft_skill: {
                    include: {
                        soft_skill: true
                    }
                }
            }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
        }

        // Preparar dados para a IA conforme formato esperado
        // Separar respostas Personalizadas (qa) de Comportamentais (da)
        const qa = responses
            .filter((r: any) => r.category === "Personalizada")
            .map((r: any) => ({
                question: r.question,
                answer: r.answer
            }));

        const da = responses
            .filter((r: any) => r.category !== "Personalizada")
            .map((r: any) => ({
                question: r.question,
                answer: r.answer
            }));

        const aiPayload = {
            qa: qa,
            items: vacancy.descricao,
            skills: vacancy.vaga_soft_skill.map(vss => vss.soft_skill.nome),
            da: da,
            // Metadados extras
            context: {
                cargo: vacancy.cargo,
                duracao_segundos: duration,
                penalidades_saida_tela: penalties
            }
        };

        let aiResult = {
            general_score: 0,
            d_score: 0,
            i_score: 0,
            s_score: 0,
            c_score: 0,
            reason: "Erro ao processar com IA",
            suggestions: [] as string[],
            matchedSkills: [] as string[]
        };

        if (IA_SUGGEST_URL) {
            try {
                const aiResponse = await fetch(IA_SUGGEST_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aiPayload)
                });

                if (aiResponse.ok) {
                    const data = await aiResponse.json();

                    aiResult = {
                        general_score: data.score || 0,
                        d_score: data.score_D || 0,
                        i_score: data.score_I || 0,
                        s_score: data.score_S || 0,
                        c_score: data.score_C || 0,
                        reason: data.explanation || "",
                        suggestions: data.suggestions || [],
                        matchedSkills: data.matchedSkills || []
                    };
                }
            } catch (e) {
                console.error("Erro na chamada da IA:", e);
            }
        }

        // Salvar em vaga_avaliacao
        // Resposta armazena o histórico completo de Q&A e metadados
        // Breakdown armazena o resultado detalhado da IA
        await prisma.vaga_avaliacao.upsert({
            where: {
                vaga_id_candidato_id: {
                    vaga_id,
                    candidato_id
                }
            },
            update: {
                score: Math.round(aiResult.general_score),
                resposta: JSON.stringify({
                    responses,
                    metrics: {
                        duration,
                        penalties,
                        timestamp: new Date().toISOString()
                    }
                }),
                breakdown: JSON.stringify(aiResult),
                updated_at: new Date()
            },
            create: {
                id: randomUUID(),
                uuid: randomUUID(),
                vaga_id,
                candidato_id,
                score: Math.round(aiResult.general_score),
                resposta: JSON.stringify({
                    responses,
                    metrics: {
                        duration,
                        penalties,
                        timestamp: new Date().toISOString()
                    }
                }),
                breakdown: JSON.stringify(aiResult),
                updated_at: new Date()
            }
        });

        // Buscar dados da empresa para obter o email
        const company = await prisma.empresa.findUnique({
            where: { id: vacancy.empresa_id },
            include: { usuario: true }
        });

        // Buscar dados do candidato para o email
        const candidate = await prisma.candidato.findUnique({
            where: { id: candidato_id }
        });

        // Enviar email para a empresa
        if (company?.usuario?.email && candidate) {
            const vacancyLink = `${process.env.APP_URL}/company/vacancies/${vacancy.uuid}/candidates`;
            await sendNewApplicationEmail(
                company.usuario.email,
                company.nome_empresa || "Empresa",
                `${candidate.nome || ''} ${candidate.sobrenome || ''}`.trim() || 'Candidato',
                vacancy.cargo,
                vacancyLink
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro ao submeter candidatura:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
