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
            },
            empresa_link: {
                orderBy: {
                    ordem: 'asc'
                }
            }
        }
    });

    if (!company) {
        redirect("/auth/login");
    }

    const rawTelefone = company.telefone || '';
    let ddi = '';
    let ddd = '';
    let numero = '';

    if (rawTelefone.includes('|')) {
        const parts = rawTelefone.split('|');
        ddi = parts[0].replace('+', '');
        ddd = parts[1] || '';
        numero = parts[2] || '';
    } else {
        const cleanTelefone = rawTelefone.replace(/\D/g, '');
        if (cleanTelefone.length >= 12 && cleanTelefone.startsWith('55')) {
            ddi = '55';
            ddd = cleanTelefone.substring(2, 4);
            numero = cleanTelefone.substring(4);
        } else if (cleanTelefone.length >= 10) {
            const numLen = cleanTelefone.length >= 11 ? 9 : 8;
            numero = cleanTelefone.slice(-numLen);
            ddd = cleanTelefone.slice(-numLen - 2, -numLen);
            ddi = cleanTelefone.slice(0, -numLen - 2);
        } else {
            numero = rawTelefone;
        }
    }

    const initialData = {
        ...company,
        ddi,
        ddd,
        numero,
        anexos: company.empresa_arquivo.map(a => ({
            id: a.id,
            nome: a.nome,
            mime: a.mime,
            tamanho: a.tamanho,
            url: a.url,
            criadoEm: a.criadoEm.toISOString(),
        })),
        links: company.empresa_link.map(l => ({
            id: l.id,
            label: l.label,
            url: l.url,
            ordem: l.ordem
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
