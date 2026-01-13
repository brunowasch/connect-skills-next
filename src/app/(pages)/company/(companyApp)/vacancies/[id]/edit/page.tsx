import { prisma } from "@/src/lib/prisma";
import { VacancyForm } from "../../_components/VacancyForm";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditVacancyPage({ params }: Props) {
    const { id } = await params;

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

    const fullVacancy = {
        ...vacancy,
        vaga_area: vagaAreas,
        vaga_soft_skill: vagaSoftSkills,
        // Match string/number types if needed. Prisma returns Decimals for salario?
        // Form expects string/number. Serialization might warn about Decimal.
        // We should convert Decimal to string/number.
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
            />
        </div>
    );
}
