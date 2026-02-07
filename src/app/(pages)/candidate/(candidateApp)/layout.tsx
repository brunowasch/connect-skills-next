import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import CandidateClientLayout from "./CandidateClientLayout";
import { getCandidateNotifications } from "@/src/lib/notifications";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
            candidato: {
                include: { candidato_area: true }
            }
        }
    });

    if (!user) {
        redirect("/login");
    }

    const candidato = user.candidato;
    if (!candidato) {
        redirect("/candidate/register");
    }

    const hasName = candidato.nome && candidato.nome.trim() !== "";
    const hasBirthDate = !!candidato.data_nascimento;
    const hasAreas = candidato.candidato_area && candidato.candidato_area.length > 0;

    if (!hasName || !hasBirthDate) {
        redirect("/candidate/register");
    }

    if (!hasAreas) {
        redirect("/candidate/area");
    }

    const notifications = await getCandidateNotifications(candidato.id);

    return (
        <CandidateClientLayout notifications={notifications}>
            {children}
        </CandidateClientLayout>
    );
}
