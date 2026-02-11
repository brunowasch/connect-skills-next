import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import CompanyClientLayout from "./CompanyClientLayout";
import { getCompanyNotifications } from "@/src/lib/notifications";
import { checkCompanyRestrictions } from "@/src/lib/companyRestrictions";
import PendingEvaluationBanner from "./_components/PendingEvaluationBanner";
import DisabledOverlay from "./_components/DisabledOverlay";

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

    const normalizedType = user.tipo.toUpperCase();
    if (normalizedType === 'CANDIDATO') {
        redirect("/candidate/dashboard");
    }

    const empresa = user.empresa;
    if (!empresa) {
        redirect("/company/register");
    }

    const hasSocialReason = empresa.nome_empresa && empresa.nome_empresa.trim() !== "";

    if (!hasSocialReason) {
        redirect("/company/register");
    }

    // Verificar se a empresa tem vídeos expirados sem avaliação
    const expiredVideos = await checkCompanyRestrictions(empresa!.id);

    const notifications = await getCompanyNotifications(empresa!.id);

    // Se houver vídeos expirados, mostrar banner e desabilitar funcionalidades
    if (expiredVideos && expiredVideos.length > 0) {
        return (
            <>
                <PendingEvaluationBanner expiredVideos={expiredVideos} />
                <DisabledOverlay expiredVideos={expiredVideos} />
                <CompanyClientLayout notifications={notifications}>
                    {children}
                </CompanyClientLayout>
            </>
        );
    }

    return (
        <CompanyClientLayout notifications={notifications}>
            {children}
        </CompanyClientLayout>
    );
}
