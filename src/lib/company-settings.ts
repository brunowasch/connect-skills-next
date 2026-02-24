import { prisma } from "@/src/lib/prisma";

export async function shouldCompanyReceiveEmails(companyId: string): Promise<boolean> {
    try {
        const settingLink = await prisma.empresa_link.findFirst({
            where: {
                empresa_id: companyId,
                label: '__CONFIG_RECEIVE_EMAILS__'
            },
            select: { url: true }
        });

        if (!settingLink) return true;
        return settingLink.url === 'true';
    } catch (error) {
        console.error("Error checking email preference:", error);
        return true;
    }
}
