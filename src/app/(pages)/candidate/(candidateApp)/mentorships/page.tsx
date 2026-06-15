import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { MentorshipsClient } from "./_components/MentorshipsClient";

export const dynamic = "force-dynamic";

export default async function CandidateMentorshipsPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const candidate = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        include: {
            candidato_area: {
                include: { area_interesse: true }
            }
        }
    });

    if (!candidate) {
        redirect("/login");
    }

    // Candidate areas of interest names and ids
    const candidateAreaIds = candidate.candidato_area.map((ca) => ca.area_interesse_id);
    const candidateAreas = candidate.candidato_area.map((ca) => ca.area_interesse.nome).filter(Boolean) as string[];

    // Fetch all areas of interest for the filter dropdown
    const allAreas = await prisma.area_interesse.findMany({
        orderBy: { nome: "asc" }
    });

    // Find all future slots that are already booked
    const now = new Date();
    const brazilDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const today = brazilDate.getFullYear() + "-"
        + String(brazilDate.getMonth() + 1).padStart(2, "0") + "-"
        + String(brazilDate.getDate()).padStart(2, "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeInterviews = await (prisma as any).entrevista_mentor.findMany({
        where: {
            status: {
                in: ["PENDENTE_CANDIDATO", "CONFIRMADA", "CONCLUIDA"]
            }
        },
        select: { disponibilidade_id: true }
    });

    const bookedSlotIds = new Set(activeInterviews.map((i: { disponibilidade_id: string }) => i.disponibilidade_id));

    // Fetch all mentors
    const mentorsRaw = await prisma.mentor.findMany({
        include: {
            mentor_area: {
                include: { area_interesse: true }
            },
            mentor_disponibilidade: {
                where: {
                    data: { gte: today }
                },
                orderBy: [
                    { data: "asc" },
                    { hora_inicio: "asc" }
                ]
            }
        }
    });

    // Filter slots that are not booked
    const mentors = mentorsRaw.map(mentor => {
        const availableSlots = mentor.mentor_disponibilidade.filter(
            (slot) => !bookedSlotIds.has(slot.id)
        );

        return {
            id: mentor.id,
            nome: mentor.nome,
            sobrenome: mentor.sobrenome,
            bio: mentor.bio,
            foto_perfil: mentor.foto_perfil,
            cidade: mentor.cidade,
            estado: mentor.estado,
            pais: mentor.pais,
            areas: mentor.mentor_area.map((ma) => ma.area_interesse.nome).filter(Boolean) as string[],
            mentor_area: mentor.mentor_area,
            mentor_disponibilidade: availableSlots
        };
    });

    const bookedMentorshipsRaw = await prisma.entrevista_mentor.findMany({
        where: {
            candidato_id: candidate.id,
            vaga_id: null, // Apenas mentorias diretas (sem vaga vinculada)
        },
        orderBy: [
            { data: 'asc' },
            { hora_inicio: 'asc' }
        ]
    });

    const bookedMentorships = await Promise.all(
        bookedMentorshipsRaw.map(async (session) => {
            const mentor = await prisma.mentor.findUnique({
                where: { id: session.mentor_id },
                select: {
                    id: true,
                    nome: true,
                    sobrenome: true,
                    foto_perfil: true,
                    bio: true
                }
            });
            return {
                ...session,
                mentor
            };
        })
    );

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
            <div className="mx-auto max-w-6xl">
                <MentorshipsClient
                    mentors={mentors}
                    candidateAreas={candidateAreas}
                    candidateAreaIds={candidateAreaIds}
                    allAreas={allAreas}
                    myMentorships={bookedMentorships}
                />
            </div>
        </main>
    );
}
