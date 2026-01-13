import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { CompanyVacancyCard } from "./_components/CompanyVacancyCard";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function VacanciesPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        return <div>Não autorizado</div>;
    }

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
    });

    if (!company) {
        return <div>Empresa não encontrada</div>;
    }

    const vacancies = await prisma.vaga.findMany({
        where: { empresa_id: company.id },
        orderBy: { created_at: 'desc' },
    });

    const vacancyIds = vacancies.map(v => v.id);

    const applicationCounts = await prisma.vaga_avaliacao.groupBy({
        by: ['vaga_id'],
        _count: {
            vaga_id: true
        },
        where: {
            vaga_id: { in: vacancyIds }
        }
    });

    const statuses = await prisma.vaga_status.findMany({
        where: { vaga_id: { in: vacancyIds } },
        orderBy: { criado_em: 'desc' }
    });

    const vacanciesWithCounts = vacancies.map(vacancy => {
        const count = applicationCounts.find(c => c.vaga_id === vacancy.id)?._count.vaga_id || 0;
        const statusRecord = statuses.find(s => s.vaga_id === vacancy.id);
        const rawStatus = statusRecord ? statusRecord.situacao.toUpperCase() : 'ATIVA';
        const status = ['INATIVA', 'FECHADA', 'ENCERRADA'].includes(rawStatus) ? 'Inativa' : 'Ativa';

        return {
            ...vacancy,
            status,
            _count: {
                vaga_avaliacao: count
            }
        };
    });

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Minhas Vagas</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas oportunidades e visualize candidaturas.</p>
                </div>
                <Link
                    href="/company/vacancies/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Publicar Vaga
                </Link>
            </div>

            {vacanciesWithCounts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Nenhuma vaga publicada</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Comece a contratar agora! Publique sua primeira vaga e encontre os melhores talentos.
                    </p>
                    <Link
                        href="/company/vacancies/new"
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                    >
                        Criar primeira vaga
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vacanciesWithCounts.map((vacancy) => (
                        <CompanyVacancyCard
                            key={vacancy.id}
                            vacancy={{
                                ...vacancy,
                                tipo_local_trabalho: vacancy.tipo_local_trabalho as any
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}