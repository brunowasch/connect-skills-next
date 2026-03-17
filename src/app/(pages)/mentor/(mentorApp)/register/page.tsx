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
        include: { mentor: true }
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    const initialName = user.mentor?.nome || user.nome || "";
    const initialSurname = user.mentor?.sobrenome || user.sobrenome || "";

    return (
        <RegisterMentorInfo initialName={initialName} initialSurname={initialSurname} userId={userId} />
    );
}
