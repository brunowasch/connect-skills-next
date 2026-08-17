import { Header, Footer } from "@/src/app/_components/Layout";
import { MentorAvailabilityEditSingle } from "../../_components/MentorAvailabilityEditSingle";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { parseSessionValue } from "@/src/lib/session";

export default async function MentorAvailabilityEditIdPage({ params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: true }
    });

    if (!user || user.tipo !== "MENTOR" || !user.mentor) {
        redirect("/");
    }

    const { id } = await params;

    const slot = await (prisma as any).mentor_disponibilidade.findUnique({
        where: { id }
    });

    if (!slot || slot.mentor_id !== user.mentor.id) {
        redirect("/mentor/availability");
    }

    return (
        <MentorAvailabilityEditSingle slot={slot} />
    );
}
