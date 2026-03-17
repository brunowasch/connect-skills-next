import { Header, Footer } from "@/src/app/_components/Layout";
import { MentorAvailability } from "./_components/MentorAvailability";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorAvailabilityPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: { include: { mentor_disponibilidade: true } } }
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    const currentAvailability = (user.mentor as any)?.mentor_disponibilidade || [];

    return (
        <MentorAvailability initialAvailability={currentAvailability} userId={userId} />
    );
}
