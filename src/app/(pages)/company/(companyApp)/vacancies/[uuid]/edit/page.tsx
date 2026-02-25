import { prisma } from "@/src/lib/prisma";
import { VacancyForm } from "../../_components/VacancyForm";
import { VacancyFormHeader } from "../../_components/VacancyFormHeader";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

interface Props {
    params: Promise<{ uuid: string }>;
}

export default async function EditVacancyPage({ params }: Props) {
    const { uuid } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { cidade: true, estado: true, pais: true }
    });

    const vacancy = await prisma.vaga.findFirst({
        where: {
            OR: [
                { uuid: uuid },
                { id: uuid }
            ]
        },
    });

    if (!vacancy) notFound();

    const id = vacancy.id;

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
            <VacancyFormHeader mode="edit" />

            <VacancyForm
                areas={areas}
                softSkills={softSkills}
                initialData={fullVacancy}
                vacancyUuid={uuid}
                companyProfile={company}
            />
        </div>
    );
}
