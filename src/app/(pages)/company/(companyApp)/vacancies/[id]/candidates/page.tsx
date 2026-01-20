import { prisma } from "@/src/lib/prisma";
import Link from 'next/link';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, User, BrainCircuit } from "lucide-react";
import { ApplicationDetails } from "./_components/ApplicationDetails";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VacancyCandidatesPage({ params }: Props) {
    const { id } = await params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/pages/auth/login");
    }

    // Verificar se o usuário é uma empresa e qual seu ID
    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { id: true }
    });

    if (!company) {
        // Se não for empresa, não deve estar aqui
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Acesso Negado</h1>
                    <p className="text-gray-500">Apenas empresas podem visualizar esta página.</p>
                </div>
            </div>
        );
    }

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

    // Verificar se a empresa logada é a dona da vaga
    if (vacancy.empresa_id !== company.id) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Acesso Negado</h1>
                    <p className="text-gray-500">Você não tem permissão para visualizar os candidatos desta vaga.</p>
                </div>
            </div>
        );
    }

    const applications = await prisma.vaga_avaliacao.findMany({
        where: { vaga_id: id },
        orderBy: { score: 'desc' }
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
        let breakdown: any = {};
        try {
            breakdown = app?.breakdown ? JSON.parse(app.breakdown) : {};
        } catch (e) {
            console.error("Erro ao processar breakdown:", e);
        }

        return {
            ...c,
            application: app,
            breakdown
        };
    }).sort((a, b) => (b.application?.score || 0) - (a.application?.score || 0));

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">Ranking de Candidatos: <span className="text-blue-600">{vacancy.cargo}</span></h1>
                    <p className="text-gray-500">Candidatos ordenados por afinidade com a vaga através de análise de IA.</p>
                </div>
            </div>

            {candidatesWithApp.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500">Nenhum candidato aplicou para esta vaga ainda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {candidatesWithApp.map((candidate, index) => (
                        <div key={candidate.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                                {candidate.foto_perfil || candidate.usuario?.avatarUrl ? (
                                                    <img src={candidate.foto_perfil || candidate.usuario?.avatarUrl!} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={32} className="text-blue-400" />
                                                )}
                                            </div>
                                            <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-900">{candidate.nome} {candidate.sobrenome}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                {candidate.cidade && <span>{candidate.cidade}, {candidate.estado}</span>}
                                                {candidate.usuario?.email && <span className="flex items-center gap-1"><Mail size={12} /> {candidate.usuario.email}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="text-xs text-gray-400">Aplicou em {candidate.application?.created_at.toLocaleDateString('pt-BR')}</div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Match Score</span>
                                            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-lg font-black bg-blue-600 text-white shadow-lg shadow-blue-100">
                                                {candidate.application?.score || 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Justificativa da IA (Preview) */}
                                {candidate.breakdown?.reason && (
                                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BrainCircuit size={16} className="text-blue-600" />
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Justificativa da IA</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
                                            "{candidate.breakdown.reason}"
                                        </p>
                                    </div>
                                )}

                                <ApplicationDetails application={candidate.application} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
