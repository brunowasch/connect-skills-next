import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CandidatesPageContent } from "./_components/CandidatesPageContent";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VacancyCandidatesPage({ params }: Props) {
    const { id } = await params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    // Verificar se o usuário é uma empresa e qual seu ID
    const company = await prisma.empresa.findUnique({
        where: { usuario_id: userId },
        select: { id: true }
    });

    if (!company) {
        return <CandidatesPageContent state="access_denied" />;
    }

    const vacancy = await prisma.vaga.findUnique({
        where: { id },
    });

    if (!vacancy) {
        return <CandidatesPageContent state="not_found" />;
    }

    // Verificar se a empresa logada é a dona da vaga
    if (vacancy.empresa_id !== company.id) {
        return <CandidatesPageContent state="company_mismatch" />;
    }

    const applications = await prisma.vaga_avaliacao.findMany({
        where: { vaga_id: id },
        orderBy: { score: 'desc' }
    });

    const candidateIds = applications.map(app => app.candidato_id);

    // Fetch candidates
    const candidates = await prisma.candidato.findMany({
        where: { id: { in: candidateIds } },
        include: {
            usuario: {
                select: { email: true, avatarUrl: true }
            }
        }
    });

    // Map applications to candidates for easier display (e.g. show score/date)
    const candidatesWithApp = candidates.map(c => {
        const app = applications.find(a => a.candidato_id === c.id);
        let breakdown: any = {};
        try {
            breakdown = app?.breakdown ? JSON.parse(app.breakdown) : {};
        } catch (e) {
            console.error("Erro ao processar breakdown:", e);
        }

        return {
            ...c,
            application: app,
            breakdown
        };
    }).sort((a, b) => (b.application?.score || 0) - (a.application?.score || 0));

    return (
        <CandidatesPageContent
            state="success"
            vacancy={{ cargo: vacancy.cargo }}
            candidates={candidatesWithApp}
        />
    );
}
