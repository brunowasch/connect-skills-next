import { MentorDashboardContent, MentorData } from "./_components/MentorDashboard";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default async function MentorDashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
            mentor: {
                include: {
                    mentor_area: { include: { area_interesse: true } },
                    mentor_disponibilidade: true
                }
            }
        }
    });

    if (!user || user.tipo !== "MENTOR" || !user.mentor) {
        redirect("/mentor/register");
    }

    const upcomingInterviewsRaw = await prisma.entrevista_mentor.findMany({
        where: {
            mentor_id: user.mentor.id,
            status: "CONFIRMADA",
        },
        orderBy: {
            data: 'asc'
        }
    });

    const upcomingInterviews = await Promise.all(upcomingInterviewsRaw.map(async (int: any) => {
        const vaga = await prisma.vaga.findUnique({
            where: { id: int.vaga_id },
            select: { cargo: true, empresa_id: true }
        });
        
        let empresaData = null;
        if (vaga?.empresa_id) {
            empresaData = await prisma.empresa.findUnique({
                where: { id: vaga.empresa_id },
                select: { nome_empresa: true, foto_perfil: true }
            });
        }

        const candidato = await prisma.candidato.findUnique({
            where: { id: int.candidato_id },
            select: { nome: true, sobrenome: true, foto_perfil: true }
        });

        return {
            id: int.id,
            data: int.data,
            hora_inicio: int.hora_inicio,
            hora_fim: int.hora_fim,
            cargo: vaga?.cargo || "Mentoria",
            empresa: empresaData?.nome_empresa || "Empresa",
            empresaFoto: empresaData?.foto_perfil || null,
            candidato: `${candidato?.nome || ""} ${candidato?.sobrenome || ""}`.trim(),
            candidatoFoto: candidato?.foto_perfil || null,
            link_reuniao: int.link_reuniao
        };
    }));

    const mentor: MentorData = {
        nome: user.mentor.nome,
        sobrenome: user.mentor.sobrenome,
        foto_perfil: user.mentor.foto_perfil,
        bio: user.mentor.bio,
        specialties: user.mentor.mentor_area
            .map((ma) => ma.area_interesse.nome)
            .filter((nome): nome is string => !!nome),
        availabilityCount: user.mentor.mentor_disponibilidade.length,
    };

    return (
        <MentorDashboardContent mentor={mentor} upcomingInterviews={upcomingInterviews} />
    );
}