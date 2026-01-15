import { prisma } from "@/src/lib/prisma";
import { VacancyForm } from "../../_components/VacancyForm";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditVacancyPage({ params }: Props) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { cidade: true, estado: true, pais: true }
    });

    const vacancy = await prisma.vaga.findUnique({
        where: { id },
    });

    if (!vacancy) notFound();

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
                <h1 className="text-2xl font-bold text-slate-900">Editar Vaga</h1>
                <p className="text-gray-500">Atualize os dados da sua oportunidade.</p>
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
