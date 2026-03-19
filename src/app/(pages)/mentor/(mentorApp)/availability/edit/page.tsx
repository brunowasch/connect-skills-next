import { Header, Footer } from "@/src/app/_components/Layout";
import { MentorAvailability } from "../_components/MentorAvailability";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

const diasMapReverso: Record<number, string> = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado"
};

export default async function MentorAvailabilityEditPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    return (
        <MentorAvailability userId={userId} />
    );
}
