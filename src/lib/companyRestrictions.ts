import { prisma } from "./prisma";

export interface ExpiredVideo {
  id: string;
  vacancyTitle: string;
  vacancyUuid: string;
  candidateName: string;
  candidateId: string;
  submittedAt: string;
  expiresAt: string;
}

// Verify if company has expired videos to evaluate

export async function checkCompanyRestrictions(
  companyId: string,
): Promise<ExpiredVideo[] | null> {
  try {
    const companyVacancies = await prisma.vaga.findMany({
      where: { empresa_id: companyId },
      select: { id: true, uuid: true, cargo: true },
    });

    const vacancyIds = companyVacancies.map((v) => v.id);

    if (vacancyIds.length === 0) {
      return null;
    }

    const applicationsWithVideos = await prisma.vaga_avaliacao.findMany({
      where: {
        vaga_id: { in: vacancyIds },
        breakdown: {
          contains: '"status":"submitted"',
        },
      },
      select: {
        id: true,
        vaga_id: true,
        candidato_id: true,
        breakdown: true,
      },
    });

    const expiredVideos: ExpiredVideo[] = [];
    const now = new Date();

    const candidateIds = applicationsWithVideos.map((app) => app.candidato_id);
    const candidates = await prisma.candidato.findMany({
      where: { id: { in: candidateIds } },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
      },
    });

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));
    const vacancyMap = new Map(companyVacancies.map((v) => [v.id, v]));

    for (const app of applicationsWithVideos) {
      try {
        if (!app.breakdown) continue;

        const breakdown =
          typeof app.breakdown === "string"
            ? JSON.parse(app.breakdown)
            : app.breakdown;

        const hasVideo = breakdown.video?.status === "submitted";
        const hasFeedback = breakdown.feedback?.status;

        if (hasVideo && !hasFeedback) {
          const submittedAt = new Date(breakdown.video.submittedAt);
          const expiresAt = new Date(submittedAt);
          expiresAt.setDate(expiresAt.getDate() + 7);

          if (now > expiresAt) {
            const candidate = candidateMap.get(app.candidato_id);
            const vacancy = vacancyMap.get(app.vaga_id);

            if (candidate && vacancy) {
              expiredVideos.push({
                id: app.id,
                vacancyTitle: vacancy.cargo,
                vacancyUuid: vacancy.uuid || vacancy.id,
                candidateName:
                  `${candidate.nome || ""} ${candidate.sobrenome || ""}`.trim() ||
                  "Candidato",
                candidateId: app.candidato_id,
                submittedAt: breakdown.video.submittedAt,
                expiresAt: expiresAt.toISOString(),
              });
            }
          }
        }
      } catch (e) {
        console.error("Error parsing breakdown:", e);
        continue;
      }
    }

    return expiredVideos.length > 0 ? expiredVideos : null;
  } catch (error) {
    console.error("Error checking company restrictions:", error);
    return null;
  }
}
