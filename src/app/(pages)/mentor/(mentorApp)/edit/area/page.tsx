import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { EditSpecialties } from "@/src/app/(pages)/mentor/(mentorApp)/edit/area/_components/EditSpecialties";
import { parseSessionValue } from "@/src/lib/session";

export default async function EditMentorSpecialtiesPage() {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: { include: { mentor_area: { include: { area_interesse: true } } } } }
    });

    if (!user || user.tipo !== "MENTOR" || !user.mentor) {
        redirect("/");
    }

    const initialSpecialties = user.mentor.mentor_area.map((ma: any) => ma.area_interesse.nome || '');

    return <EditSpecialties initialSpecialties={initialSpecialties} />;
}