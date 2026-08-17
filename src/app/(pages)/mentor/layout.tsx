import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { parseSessionValue } from "@/src/lib/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) {
        redirect("/");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true, tipo: true }
    });

    if (!user || user.tipo !== "MENTOR") {
        redirect("/");
    }

    return <>{children}</>;
}
