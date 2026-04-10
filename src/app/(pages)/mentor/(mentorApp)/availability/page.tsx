import { MentorAvailabilityList } from "./_components/MentorAvailabilityList";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorAvailabilityPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { mentor: { include: { mentor_disponibilidade: true } } }
    });

    if (!user || user.tipo !== "MENTOR" || !user.mentor) {
        redirect("/");
    }

    const currentAvailability = user.mentor.mentor_disponibilidade || [];

    const entrevistas = await prisma.entrevista_mentor.findMany({
        where: { mentor_id: user.mentor.id }
    });

    const vagaIds = entrevistas.map(e => e.vaga_id).filter(Boolean);
    const vagas = vagaIds.length > 0 ? await prisma.vaga.findMany({
        where: { id: { in: vagaIds } }
    }) : [];
    
    const empresaIds = vagas.map(v => v.empresa_id).filter(Boolean);
    const empresas = empresaIds.length > 0 ? await prisma.empresa.findMany({
        where: { id: { in: empresaIds } },
        select: { id: true, uuid: true, nome_empresa: true, foto_perfil: true }
    }) : [];

    const empresasMap = new Map(empresas.map(e => [e.id, e]));
    const vagasMap = new Map(vagas.map(v => [v.id, v]));

    const enrichedAvailability = currentAvailability.map((slot: any) => {
        const agendado = entrevistas.find(e => e.disponibilidade_id === slot.id);
        let agendamento = null;
        if (agendado) {
            const vaga = vagasMap.get(agendado.vaga_id);
            if (vaga) {
                const empresa = empresasMap.get(vaga.empresa_id);
                if (empresa) {
                    agendamento = {
                        empresaNome: empresa.nome_empresa,
                        empresaFoto: empresa.foto_perfil,
                        empresaUuid: empresa.uuid,
                        link_reuniao: agendado.link_reuniao
                    };
                }
            }
        }
        return {
            ...slot,
            agendamento
        };
    });

    return (
        <MentorAvailabilityList slots={enrichedAvailability} />
    );
}
