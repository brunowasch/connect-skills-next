import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import CompanyClientLayout from "./CompanyClientLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
            empresa: true
        }
    });

    if (!user) {
        redirect("/login");
    }

    const empresa = user.empresa;
    if (!empresa) {
        redirect("/company/register");
    }

    const hasSocialReason = empresa.nome_empresa && empresa.nome_empresa.trim() !== "";

    if (!hasSocialReason) {
        redirect("/company/register");
    }

    return (
        <CompanyClientLayout>
            {children}
        </CompanyClientLayout>
    );
}
