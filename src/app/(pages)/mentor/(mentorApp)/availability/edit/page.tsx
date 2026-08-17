import { Header, Footer } from "@/src/app/_components/Layout";
import { MentorAvailability } from "../_components/MentorAvailability";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { parseSessionValue } from "@/src/lib/session";

export default async function MentorAvailabilityEditPage() {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

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
        <MentorAvailability />
    );
}
