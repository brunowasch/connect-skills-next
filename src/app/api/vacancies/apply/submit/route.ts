import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
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
            select: { cargo: true, descricao: true }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
        }

        // Preparar dados para a IA
        const aiPayload = {
            cargo: vacancy.cargo,
            descricao_vaga: vacancy.descricao,
            respostas: responses.map((r: any) => ({
                pergunta: r.question,
                resposta: r.answer,
                categoria: r.category,
                metodo_disc: r.method
            })),
            metadados: {
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
            suggestions: ""
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
                    // Assumindo que a IA retorna os campos esperados. 
                    // Se os nomes forem diferentes, ajustamos aqui.
                    aiResult = {
                        general_score: data.Score_geral || data.general_score || 0,
                        d_score: data.D_Score || data.d_score || 0,
                        i_score: data.I_Score || data.i_score || 0,
                        s_score: data.S_Score || data.s_score || 0,
                        c_score: data.C_Score || data.c_score || 0,
                        reason: data.motivo || data.reason || "",
                        suggestions: data.sugestoes || data.suggestions || ""
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

        return NextResponse.json({ success: true, aiResult });

    } catch (error) {
        console.error("Erro ao submeter candidatura:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
