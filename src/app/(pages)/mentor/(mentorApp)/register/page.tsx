import { Header, Footer } from "@/src/app/_components/Layout";
import { RegisterMentorInfo } from "./_components/RegisterMentor";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorRegisterPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: { include: { mentor_area: true } } }
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    const hasName = !!(user.mentor?.nome?.trim() && user.mentor?.sobrenome?.trim());
    const hasAreas = !!(user.mentor?.mentor_area && user.mentor.mentor_area.length > 0);

    if (hasName && hasAreas) {
        redirect("/mentor/dashboard");
    }

    if (hasName && !hasAreas) {
        redirect("/mentor/specialties");
    }

    const initialName = user.mentor?.nome || user.nome || "";
    const initialSurname = user.mentor?.sobrenome || user.sobrenome || "";

    return (
        <RegisterMentorInfo initialName={initialName} initialSurname={initialSurname} userId={userId} />
    );
}
