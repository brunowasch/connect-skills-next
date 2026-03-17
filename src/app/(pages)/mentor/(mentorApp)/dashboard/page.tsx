import { MentorDashboardContent, MentorData } from "./_components/MentorDashboard";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorDashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
            mentor: {
                include: {
                    mentor_area: { include: { area_interesse: true } },
                    mentor_disponibilidade: true
                }
            }
        }
    });

    if (!user || user.tipo !== "MENTOR" || !user.mentor) {
        redirect("/mentor/register");
    }

    const mentor: MentorData = {
        nome: user.mentor.nome,
        sobrenome: user.mentor.sobrenome,
        foto_perfil: user.mentor.foto_perfil,
        bio: user.mentor.bio,
        specialties: user.mentor.mentor_area
            .map((ma) => ma.area_interesse.nome)
            .filter((nome): nome is string => !!nome),
        availabilityCount: user.mentor.mentor_disponibilidade.length,
    };

    return (
        <MentorDashboardContent mentor={mentor} />
    );
}
