import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { EditCompanyProfile } from "./_components/EditCompanyProfile";

export default async function EditCompanyProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/pages/auth/login");
    }

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        include: {
            empresa_arquivo: {
                orderBy: {
                    criadoEm: 'desc'
                }
            }
        }
    });

    if (!company) {
        redirect("/auth/login");
    }

    const initialData = {
        ...company,
        anexos: company.empresa_arquivo.map(a => ({
            id: a.id,
            nome: a.nome,
            mime: a.mime,
            tamanho: a.tamanho,
            url: a.url,
            criadoEm: a.criadoEm.toISOString(),
        })),
    };

    return (
        <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Perfil da Empresa</h1>
            <p className="text-gray-500 mb-8">
                Atualize as informações da sua empresa.
            </p>
            <EditCompanyProfile initialData={initialData} />
        </div>
    );
}
