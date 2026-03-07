import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import AssessmentComponent from "./_components/AssessmentComponent";

export default async function ApplyPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    const vacancy = await prisma.vaga.findUnique({
        where: { uuid },
        include: {
            vaga_soft_skill: {
                include: {
                    soft_skill: true
                }
            }
        }
    });

    if (!vacancy) {
        notFound();
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Por favor, faça login para continuar.</p>
            </div>
        );
    }

    const candidate = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        select: { id: true }
    });

    if (!candidate) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Perfil de candidato não encontrado.</p>
            </div>
        );
    }

    // Passar apenas dados necessários e serializados
    const simpleVacancy = JSON.parse(JSON.stringify({
        id: vacancy.id,
        uuid: vacancy.uuid,
        cargo: vacancy.cargo,
        pergunta: vacancy.pergunta,
        vaga_soft_skill: vacancy.vaga_soft_skill.map((vss: any) => ({
            soft_skill: {
                nome: vss.soft_skill.nome
            }
        }))
    }));

    const avaliacao = await prisma.vaga_avaliacao.findUnique({
        where: {
            vaga_id_candidato_id: {
                vaga_id: vacancy.id,
                candidato_id: candidate.id
            }
        }
    });

    let initialState = undefined;

    if (avaliacao) {
        if (avaliacao.score === -1 && avaliacao.resposta) {
            try {
                const breakdown = JSON.parse(avaliacao.breakdown || "{}");
                const resposta = JSON.parse(avaliacao.resposta);
                initialState = {
                    questions: resposta.questions || [],
                    answers: resposta.answers || {},
                    currentSection: breakdown.currentSection || 0
                };
            } catch (e) {
                console.error("Erro ao parsear rascunho de avaliacao", e);
            }
        } else if (avaliacao.score >= 0) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center text-slate-800">
                        <h2 className="text-2xl font-bold mb-4">Candidatura Concluída</h2>
                        <p className="mb-6">Você já finalizou e enviou este questionário.</p>
                        <a href="/candidate/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition">
                            Voltar ao Dashboard
                        </a>
                    </div>
                </div>
            );
        }
    }

    return (
        <AssessmentComponent
            vacancy={simpleVacancy}
            candidateId={candidate.id}
            initialState={initialState}
        />
    );
}
