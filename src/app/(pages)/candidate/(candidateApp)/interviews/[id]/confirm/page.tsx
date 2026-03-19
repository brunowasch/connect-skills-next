import { prisma } from "@/src/lib/prisma";
import ConfirmInterviewClient from "./_components/ConfirmInterviewClient";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ConfirmInterviewPage({ params }: Props) {
    const { id } = await params;

    const interview = await prisma.entrevista_mentor.findUnique({
        where: { id }
    });

    let vagaTitle = "a vaga";
    let companyName = "Empresa";
    let companyPhoto = null;
    let formattedDate = "";

    if (interview) {
        const vaga = await prisma.vaga.findUnique({
            where: { id: interview.vaga_id },
            include: {
                vaga_area: { include: { area_interesse: true } }
            }
        });

        // Fetch company info from varga.empresa_id using the empresa model
        const company = await prisma.empresa.findUnique({
            where: { id: vaga!.empresa_id }
        });

        vagaTitle = vaga?.cargo || "a vaga";
        companyName = company?.nome_empresa || "Empresa";
        companyPhoto = company?.foto_perfil || null;

        const parts = interview.data.split("-");
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return (
        <ConfirmInterviewClient
            entrevistaId={id}
            status={interview?.status || "NOT_FOUND"}
            vagaTitle={vagaTitle}
            companyName={companyName}
            companyPhoto={companyPhoto}
            date={formattedDate}
            horaInicio={interview?.hora_inicio || ""}
            horaFim={interview?.hora_fim || ""}
        />
    );
}
