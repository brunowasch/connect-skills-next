import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { EditProfile } from "./_components/EditProfile";

export default async function EditProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
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
        redirect("/login");
    }

    const localidade = candidate.cidade && candidate.estado
        ? `${candidate.cidade}, ${candidate.estado}`
        : candidate.cidade || candidate.estado || '';

    const rawTelefone = candidate.telefone || '';
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
        nome: candidate.nome || '',
        sobrenome: candidate.sobrenome || '',
        cidade: candidate.cidade || '',
        estado: candidate.estado || '',
        pais: candidate.pais || 'Brasil',
        ddi: ddi,
        ddd: ddd,
        numero: numero,
        descricao: candidate.descricao || '',
        fotoPerfil: candidate.foto_perfil || undefined,
        links: candidate.candidato_link.map((l: any) => ({ id: l.id, label: l.label, url: l.url, ordem: l.ordem })),
        anexos: candidate.candidato_arquivo
            .filter((a: any) => !a.nome.startsWith(`${candidate.nome} ${candidate.sobrenome}-${Date.now()}-Video.mp4`))
            .map((a: any) => ({
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
