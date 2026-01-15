import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CompanyProfile } from "./_components/CompanyProfile";

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
    const cleanTelefone = rawTelefone.replace(/\D/g, '');

    let ddi = '';
    let ddd = '';
    let numero = '';

    if (cleanTelefone.length >= 12 && cleanTelefone.startsWith('55')) {
        ddi = '55';
        ddd = cleanTelefone.substring(2, 4);
        numero = cleanTelefone.substring(4);
    } else if (cleanTelefone.length >= 10) {
        ddd = cleanTelefone.substring(0, 2);
        numero = cleanTelefone.substring(2);
    } else {
        numero = rawTelefone;
    }

    // Format phone number
    if (numero.length === 9) {
        numero = `${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
        numero = `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }

    const contato = { ddi, ddd, numero };

    return (
        <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfil da Empresa</h1>
            <p className="text-gray-500 mb-8">
                Informações da sua empresa e dados de contato.
            </p>
            <CompanyProfile
                company={company}
                fotoPerfil={company.foto_perfil || undefined}
                localidade={localidade}
                contato={contato}
                email={company.usuario?.email}
                anexos={company.empresa_arquivo.map(a => ({
                    id: a.id,
                    nome: a.nome,
                    mime: a.mime || '',
                    tamanho: a.tamanho || 0,
                    url: a.url,
                    criadoEm: a.criadoEm.toISOString(),
                }))}
                links={company.empresa_link.map(l => ({
                    id: l.id,
                    label: l.label,
                    url: l.url,
                    ordem: l.ordem
                }))}
            />
        </div>
    );
}
