import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { EditMentorProfile } from "./_components/EditMentorProfile";

export default async function EditMentorProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const mentor = await prisma.mentor.findUnique({
        where: { usuario_id: userId },
        include: {
            mentor_link: { orderBy: { ordem: 'asc' } },
            mentor_arquivo: { orderBy: { criadoEm: 'desc' } }
        }
    }) as any;

    if (!mentor) {
        redirect("/mentor/register");
    }

    const rawTelefone = mentor.telefone || '';
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
        nome: mentor.nome || '',
        sobrenome: mentor.sobrenome || '',
        cidade: mentor.cidade || '',
        estado: mentor.estado || '',
        pais: mentor.pais || 'Brasil',
        ddi: ddi,
        ddd: ddd,
        numero: numero,
        bio: mentor.bio || '',
        fotoPerfil: mentor.foto_perfil || undefined,
        links: mentor.mentor_link.map((l: any) => ({ id: l.id, label: l.label, url: l.url, ordem: l.ordem })),
        anexos: mentor.mentor_arquivo.map((a: any) => ({
            id: a.id,
            nome: a.nome,
            url: a.url,
            mime: a.mime,
            tamanho: a.tamanho,
            criadoEm: a.criadoEm.toISOString(),
        })),
    };

    return <EditMentorProfile initialData={initialData} />;
}
