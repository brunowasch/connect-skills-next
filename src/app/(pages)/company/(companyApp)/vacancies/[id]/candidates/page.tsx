import { prisma } from "@/src/lib/prisma";
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, User } from "lucide-react";
import { ApplicationDetails } from "./_components/ApplicationDetails";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VacancyCandidatesPage({ params }: Props) {
    const { id } = await params;

    const vacancy = await prisma.vaga.findUnique({
        where: { id },
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
        where: { vaga_id: id },
        orderBy: { created_at: 'desc' }
    });

    const candidateIds = applications.map(app => app.candidato_id);

    // Fetch candidates
    const candidates = await prisma.candidato.findMany({
        where: { id: { in: candidateIds } },
        include: {
            usuario: {
                select: { email: true, avatarUrl: true }
            }
        }
    });

    // Map applications to candidates for easier display (e.g. show score/date)
    const candidatesWithApp = candidates.map(c => {
        const app = applications.find(a => a.candidato_id === c.id);
        return {
            ...c,
            application: app
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
                    <h1 className="text-2xl font-bold text-slate-900">Candidatos: <span className="text-blue-600">{vacancy.cargo}</span></h1>
                    <p className="text-gray-500">Gerencie as aplicações e visualize perfis.</p>
                </div>
            </div>

            {candidatesWithApp.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500">Nenhum candidato aplicou para esta vaga ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {candidatesWithApp.map(candidate => (
                        <div key={candidate.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0 border border-blue-200">
                                    {candidate.foto_perfil || candidate.usuario?.avatarUrl ? (
                                        <img src={candidate.foto_perfil || candidate.usuario?.avatarUrl!} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-blue-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{candidate.nome} {candidate.sobrenome}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                        {candidate.cidade && <span>{candidate.cidade}, {candidate.estado}</span>}
                                        {candidate.usuario?.email && <span className="flex items-center gap-1"><Mail size={12} /> {candidate.usuario.email}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end gap-1 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                <div className="text-xs text-gray-400">Aplicou em {candidate.application?.created_at.toLocaleDateString('pt-BR')}</div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Match Score: {candidate.application?.score || 0}%
                                </div>
                            </div>
                            <ApplicationDetails application={candidate.application} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
