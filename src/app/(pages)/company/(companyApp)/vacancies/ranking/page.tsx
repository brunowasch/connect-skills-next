import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import { RankingList } from "./_components/RankingList";

export default async function RankingPage() {
    const cookieStore = await cookies();
    const vacancyId = cookieStore.get("vacancy_ranking_id")?.value;

    if (!vacancyId) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Nenhuma vaga selecionada</h1>
                    <p className="text-gray-500 mt-2">Por favor, selecione uma vaga no painel para visualizar o ranking.</p>
                </div>
            </div>
        );
    }

    const vacancy = await prisma.vaga.findUnique({
        where: { id: vacancyId },
    });

    if (!vacancy) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Vaga não encontrada</h1>
                </div>
            </div>
        );
    }

    const applications = await prisma.vaga_avaliacao.findMany({
        where: { vaga_id: vacancyId },
        orderBy: { score: 'desc' }
    });

    const candidateIds = applications.map(app => app.candidato_id);

    const candidates = await prisma.candidato.findMany({
        where: { id: { in: candidateIds } },
        include: {
            usuario: {
                select: { email: true, avatarUrl: true }
            }
        }
    });

    const candidatesWithApp = candidates.map(c => {
        const app = applications.find(a => a.candidato_id === c.id);
        return {
            ...c,
            application: app ? {
                id: app.id,
                score: app.score,
                created_at: app.created_at,
                breakdown: app.breakdown,
                resposta: app.resposta
            } : undefined
        };
    });

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">Ranking: <span className="text-blue-600">{vacancy.cargo}</span></h1>
                    <p className="text-gray-500">Os candidatos estão ranqueados com base na compatibilidade (0–100) calculada pela nossa IA a partir das respostas. Em caso de empate, são ranqueados em ordem de chegada.</p>
                </div>
            </div>

            {candidatesWithApp.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500">Nenhum candidato aplicou para esta vaga ainda.</p>
                </div>
            ) : (
                <RankingList candidates={candidatesWithApp} vacancyId={vacancyId} />
            )}
        </div>
    );
}
