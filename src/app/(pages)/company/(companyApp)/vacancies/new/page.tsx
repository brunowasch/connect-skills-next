import { prisma } from "@/src/lib/prisma";
import { VacancyForm } from "../_components/VacancyForm";

export default async function NewVacancyPage() {
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
                <h1 className="text-2xl font-bold text-slate-900">Publicar Vaga</h1>
                <p className="text-gray-500">Preencha os dados abaixo para publicar uma nova oportunidade.</p>
            </div>

            <VacancyForm areas={areas} softSkills={softSkills} />
        </div>
    );
}
