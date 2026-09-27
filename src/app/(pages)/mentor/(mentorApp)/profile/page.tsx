import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { MentorProfile } from "./_components/MentorProfile";
import { randomUUID } from "crypto";
import { parseSessionValue } from "@/src/lib/session";

export default async function MentorProfilePage() {
    const cookieStore = await cookies();
    const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);

    if (!userId) {
        redirect("/login");
    }

    const mentor = await prisma.mentor.findUnique({
        where: { usuario_id: userId },
        include: {
            mentor_area: {
                include: {
                    area_interesse: true
                }
            },
            mentor_disponibilidade: {
                orderBy: [{ data: 'asc' }, { hora_inicio: 'asc' }]
            },
        }
    }) as any;

    if (!mentor) {
        redirect("/mentor/register");
    }

    let mentorUUID = mentor.uuid;
    if (!mentorUUID) {
        mentorUUID = randomUUID();
        await prisma.mentor.update({
            where: { id: mentor.id },
            data: { uuid: mentorUUID }
        });
    }

    const localidade = mentor.cidade && mentor.estado
        ? `${mentor.cidade} - ${mentor.estado}, ${mentor.pais || 'Brasil'}`
        : mentor.cidade || mentor.estado || null;

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

    if (numero.length === 9) {
        numero = `${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
        numero = `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }

    const contato = { ddi, ddd, numero };

    const now = new Date();
    const slots = (mentor.mentor_disponibilidade || []).filter((slot: any) => {
        if (slot.status === 'CONCLUIDA') return false;
        try {
            const [year, month, day] = slot.data.split('-').map(Number);
            const [h, m] = slot.hora_fim.split(':').map(Number);
            const slotEnd = new Date(year, month - 1, day, h, m, 0);
            return slotEnd > now;
        } catch { return true; }
    }).map((slot: any) => ({
        id: slot.id,
        data: slot.data,
        hora_inicio: slot.hora_inicio,
        hora_fim: slot.hora_fim,
        tipo: slot.tipo || null,
        status: slot.status || null,
    }));

    return (
        <div className="mb-4 sm:mb-6">
            <MentorProfile
                mentor={mentor}
                fotoPerfil={mentor.foto_perfil || undefined}
                localidade={localidade}
                contato={contato}
                perfilShareUrl={`/viewer/mentor/${mentorUUID}`}
                slots={slots}
            />
        </div>
    );
}
