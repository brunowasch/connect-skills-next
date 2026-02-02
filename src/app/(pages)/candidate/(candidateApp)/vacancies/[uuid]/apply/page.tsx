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

    return (
        <AssessmentComponent
            vacancy={simpleVacancy}
            candidateId={candidate.id}
        />
    );
}
