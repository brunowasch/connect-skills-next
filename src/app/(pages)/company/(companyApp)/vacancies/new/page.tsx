import { prisma } from "@/src/lib/prisma";
import { getAreasFromJson, getSoftSkillsFromJson } from "@/src/lib/skillsFromJson";
import { VacancyForm } from "../_components/VacancyForm";
import { VacancyFormHeader } from "../_components/VacancyFormHeader";
import { cookies } from "next/headers";

export default async function NewVacancyPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { cidade: true, estado: true, pais: true }
    });

    const [areas, softSkills] = await Promise.all([
        getAreasFromJson(),
        getSoftSkillsFromJson(),
    ]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <VacancyFormHeader mode="create" />

            <VacancyForm areas={areas} softSkills={softSkills} companyProfile={company} />
        </div>
    );
}
