import { prisma } from "@/src/lib/prisma";
import { VacancyForm } from "../_components/VacancyForm";
import { cookies } from "next/headers";

export default async function NewVacancyPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { cidade: true, estado: true, pais: true }
    });

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

            <VacancyForm areas={areas} softSkills={softSkills} companyProfile={company} />
        </div>
    );
}
