import { prisma } from "@/src/lib/prisma";
import { getAreasFromJson, getSoftSkillsFromJson } from "@/src/lib/skillsFromJson";
import { VacancyForm } from "../../_components/VacancyForm";
import { VacancyFormHeader } from "../../_components/VacancyFormHeader";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { parseSessionValue } from "@/src/lib/session";

interface Props {
    params: Promise<{ uuid: string }>;
}

export default async function EditVacancyPage({ params }: Props) {
    const { uuid } = await params;
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) notFound();

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { id: true, cidade: true, estado: true, pais: true }
    });

    if (!company) notFound();

    const vacancy = await prisma.vaga.findFirst({
        where: {
            OR: [
                { uuid: uuid },
                { id: uuid }
            ]
        },
    });

    if (!vacancy || vacancy.empresa_id !== company.id) notFound();

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

    const [areas, softSkills] = await Promise.all([
        getAreasFromJson(),
        getSoftSkillsFromJson(),
    ]);

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
