import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { vaga_id, candidato_id, currentSection, answers, questions } = body;

        if (!vaga_id || !candidato_id) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        const vacancy = await prisma.vaga.findUnique({
            where: { id: vaga_id }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
        }

        const answeredCount = Object.values(answers || {}).filter((a: any) => a.trim().length > 0).length;
        const totalCount = (questions || []).length;
        const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
        const totalSections = Math.max(1, Math.ceil(totalCount / 8));

        const breakdownData = {
            status: "incomplete",
            currentSection: currentSection || 0,
            totalSections,
            progressPct
        };

        const respostaData = {
            questions,
            answers,
            metrics: {
                timestamp: new Date().toISOString()
            }
        };

        await prisma.vaga_avaliacao.upsert({
            where: {
                vaga_id_candidato_id: {
                    vaga_id,
                    candidato_id
                }
            },
            update: {
                score: -1,
                resposta: JSON.stringify(respostaData),
                breakdown: JSON.stringify(breakdownData),
                updated_at: new Date()
            },
            create: {
                id: randomUUID(),
                uuid: randomUUID(),
                vaga_id,
                candidato_id,
                score: -1,
                resposta: JSON.stringify(respostaData),
                breakdown: JSON.stringify(breakdownData),
                updated_at: new Date()
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro ao salvar progresso parcial:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
