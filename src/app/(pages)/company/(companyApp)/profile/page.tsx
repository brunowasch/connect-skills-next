import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CompanyProfilePageContent } from "./_components/CompanyProfilePageContent";

export default async function CompanyProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/pages/auth/login");
    }

    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        include: {
            usuario: {
                select: {
                    email: true
                }
            },
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

    const localidade = company.cidade && company.estado
        ? `${company.cidade} - ${company.estado}, ${company.pais || 'Brasil'}`
        : company.cidade || company.estado || 'Localidade não informada';

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

    // Format phone number
    if (numero.length === 9) {
        numero = `${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
        numero = `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }

    const contato = { ddi, ddd, numero };

    return (
        <CompanyProfilePageContent
            company={company}
            localidade={localidade}
            contato={contato}
        />
    );
}
