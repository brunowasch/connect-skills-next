import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { EditVacancyPageContent } from "./_components/EditVacancyPageContent";

export default async function EditVacancyPage() {
    const cookieStore = await cookies();
    const id = cookieStore.get("editing_vacancy_id")?.value;
    const userId = cookieStore.get("time_user_id")?.value;

    if (!id) {
        return <EditVacancyPageContent state="no_selection" />;
    }

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { cidade: true, estado: true, pais: true }
    });

    const vacancy = await prisma.vaga.findUnique({
        where: { id },
    });

    if (!vacancy) {
        return <EditVacancyPageContent state="not_found" />;
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
        <EditVacancyPageContent
            state="success"
            areas={areas}
            softSkills={softSkills}
            initialData={fullVacancy}
            vacancyId={id}
            companyProfile={company}
        />
    );
}
