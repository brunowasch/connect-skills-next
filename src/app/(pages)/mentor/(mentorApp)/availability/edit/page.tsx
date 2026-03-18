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
        include: { mentor: { include: { mentor_disponibilidade: true } } }
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    const dbAvailability = (user.mentor as any)?.mentor_disponibilidade || [];
    
    const currentAvailability = dbAvailability.map((slot: any) => ({
        id: slot.id,
        dia_semana: diasMapReverso[slot.dia_semana] || "Segunda-feira",
        hora_inicio: slot.hora_inicio,
        hora_fim: slot.hora_fim
    }));

    return (
        <MentorAvailability initialAvailability={currentAvailability} userId={userId} />
    );
}
