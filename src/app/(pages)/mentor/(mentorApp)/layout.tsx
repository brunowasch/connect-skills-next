import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getMentorNotifications } from "@/src/lib/notifications";
import MentorClientLayout from "./MentorClientLayout";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) redirect("/login");

    const mentor = await prisma.mentor.findUnique({
        where: { usuario_id: userId },
        select: { id: true }
    });

    const notifications = mentor ? await getMentorNotifications(mentor.id) : [];

    return (
        <MentorClientLayout notifications={notifications}>
            {children}
        </MentorClientLayout>
    );
}
