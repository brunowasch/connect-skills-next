import { prisma } from "@/src/lib/prisma";
import { VacancyForm } from "../_components/VacancyForm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditVacancyPage() {
    const cookieStore = await cookies();
    const id = cookieStore.get("editing_vacancy_id")?.value;
    const userId = cookieStore.get("time_user_id")?.value;

    if (!id) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Nenhuma vaga selecionada</h1>
                    <p className="text-gray-500 mt-2">Por favor, selecione uma vaga no painel para editar.</p>
                </div>
            </div>
        );
    }

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { cidade: true, estado: true, pais: true }
    });

    const vacancy = await prisma.vaga.findUnique({
        where: { id },
    });

    if (!vacancy) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Vaga não encontrada</h1>
                    <p className="text-gray-500 mt-2">A vaga que você está tentando editar não existe ou foi removida.</p>
                </div>
            </div>
        );
    }

    const vagaAreas = await prisma.vaga_area.findMany({
        where: { vaga_id: id }
    });

    const vagaSoftSkills = await prisma.vaga_soft_skill.findMany({
        where: { vaga_id: id }
    });

    const vagaArquivos = await prisma.vaga_arquivo.findMany({
        where: { vaga_id: id }
    });

    const vagaLinks = await prisma.vaga_link.findMany({
        where: { vaga_id: id },
        orderBy: { ordem: 'asc' }
    });

    const fullVacancy = {
        ...vacancy,
        vaga_area: vagaAreas,
        vaga_soft_skill: vagaSoftSkills,
        vaga_arquivo: vagaArquivos,
        vaga_link: vagaLinks,
        salario: vacancy.salario ? Number(vacancy.salario) : ""
    };

    const areas = await prisma.area_interesse.findMany({
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true }
    });

    const softSkills = await prisma.soft_skill.findMany({
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true }
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/company/vacancies" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Vagas
                </Link>
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-slate-900">Editar Vaga</h1>
                    <p className="text-gray-500">Atualize os dados da sua oportunidade.</p>
                </div>
            </div>

            <VacancyForm
                areas={areas}
                softSkills={softSkills}
                initialData={fullVacancy}
                vacancyId={id}
                companyProfile={company}
            />
        </div>
    );
}
