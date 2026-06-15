import { Header, Footer } from "@/src/app/_components/Layout";
import { MentorSpecialties } from "./_components/MentorSpecialties";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorSpecialtiesPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: { include: { mentor_area: { include: { area_interesse: true } } } } }
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    const hasAreas = !!(user.mentor?.mentor_area && user.mentor.mentor_area.length > 0);
    if (hasAreas) {
        redirect("/mentor/dashboard");
    }

    const currentSpecialties = (user.mentor as any)?.mentor_area.map((ma: any) => ma.area_interesse.nome) || [];

    return (
        <MentorSpecialties initialSpecialties={currentSpecialties} userId={userId} />
    );
}
