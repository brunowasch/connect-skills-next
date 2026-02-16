import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
    try {
        const { videoUrl, candidateId, vacancyUuid, vacancyId } = await request.json();

        if (!candidateId || !vacancyId) {
            return NextResponse.json(
                { error: 'candidateId and vacancyId are required' },
                { status: 400 }
            );
        }

        let existingApplication = null;
        try {
            existingApplication = await prisma.vaga_avaliacao.findUnique({
                where: {
                    vaga_id_candidato_id: {
                        vaga_id: String(vacancyId),
                        candidato_id: String(candidateId)
                    }
                }
            });

            if (existingApplication?.breakdown) {
                const breakdown = typeof existingApplication.breakdown === 'string' 
                    ? JSON.parse(existingApplication.breakdown) 
                    : existingApplication.breakdown;

                if (breakdown.videoAnalysis) {
                    return NextResponse.json(breakdown.videoAnalysis);
                }
            }
        } catch (dbError) {
            console.error('Error checking existing analysis:', dbError);
        }

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'videoUrl is required to generate a new analysis' },
                { status: 400 }
            );
        }

        const iaUrl = process.env.IA_ANALYZE_VIDEO;

        if (!iaUrl) {
            console.error("Environment variable is not defined");
            return NextResponse.json(
                { error: 'AI Service configuration error' },
                { status: 500 }
            );
        }

        let position = '';
        let requisites: string[] = [];

        if (vacancyId) {
            try {
                const vacancy = await prisma.vaga.findUnique({
                    where: { id: String(vacancyId) },
                    include: {
                        vaga_soft_skill: {
                            include: {
                                soft_skill: true
                            }
                        }
                    }
                });

                if (vacancy) {
                    position = `Vaga para ${vacancy.cargo}\n\nDescrição da Vaga\n${vacancy.descricao}`;
                    requisites = vacancy.vaga_soft_skill.map(vss => vss.soft_skill.nome);
                }
            } catch (dbError) {
                console.error('Error fetching vacancy data:', dbError);
            }
        }

        console.log('Sending to AI Service:', {
            videoUrl,
            position: position.substring(0, 100) + '...',
            requisites
        });

        const response = await fetch(iaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoUrl,
                position,
                requisites
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AI Service returned status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `AI Service Error: ${response.status} - ${errorText.substring(0, 200)}` },
                { status: response.status }
            );
        }

        const aiAnalysisData = await response.json();

        try {
            if (existingApplication) {
                const currentBreakdown = existingApplication.breakdown
                    ? JSON.parse(existingApplication.breakdown)
                    : {};

                currentBreakdown.videoAnalysis = aiAnalysisData;

                await prisma.vaga_avaliacao.update({
                    where: {
                        vaga_id_candidato_id: {
                            vaga_id: String(vacancyId),
                            candidato_id: String(candidateId)
                        }
                    },
                    data: {
                        breakdown: JSON.stringify(currentBreakdown),
                        updated_at: new Date()
                    }
                });

            } else {
                console.warn('Application not found to save analysis');
            }
        } catch (saveError) {
            console.error('Error saving video analysis to database:', saveError);
        }

        return NextResponse.json(aiAnalysisData);

    } catch (error) {
        console.error('Video analysis error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
