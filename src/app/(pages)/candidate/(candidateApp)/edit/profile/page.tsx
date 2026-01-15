import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { EditProfile } from "./_components/EditProfile";

export default async function EditProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/pages/auth/login");
    }

    const candidate = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        include: {
            candidato_link: {
                orderBy: {
                    ordem: 'asc'
                }
            },
            candidato_arquivo: {
                orderBy: {
                    criadoEm: 'desc'
                }
            },
        }
    });

    if (!candidate) {
        redirect("/pages/auth/login");
    }

    const localidade = candidate.cidade && candidate.estado
        ? `${candidate.cidade}, ${candidate.estado}`
        : candidate.cidade || candidate.estado || '';

    const rawTelefone = candidate.telefone || '';
    const cleanTelefone = rawTelefone.replace(/\D/g, '');

    let ddd = '';
    let numero = '';

    if (cleanTelefone.length >= 10) {
        let startIdx = 0;
        if (cleanTelefone.startsWith('55') && cleanTelefone.length >= 12) {
            startIdx = 2;
        }
        ddd = cleanTelefone.substring(startIdx, startIdx + 2);
        numero = cleanTelefone.substring(startIdx + 2);
    } else {
        numero = rawTelefone;
    }

    const initialData = {
        nome: candidate.nome || '',
        sobrenome: candidate.sobrenome || '',
        cidade: candidate.cidade || '',
        estado: candidate.estado || '',
        pais: candidate.pais || 'Brasil',
        ddd: ddd,
        numero: numero,
        descricao: candidate.descricao || '',
        fotoPerfil: candidate.foto_perfil || undefined,
        links: candidate.candidato_link.map(l => ({ id: l.id, label: l.label, url: l.url, ordem: l.ordem })),
        anexos: candidate.candidato_arquivo.map(a => ({
            id: a.id,
            nome: a.nome,
            url: a.url,
            mime: a.mime,
            tamanho: a.tamanho,
            criadoEm: a.criadoEm.toISOString(),
        })),
    };

    return <EditProfile initialData={initialData} />;
}
