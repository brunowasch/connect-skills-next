import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import { sendProposalResponseToCompanyEmail } from '@/src/lib/mail';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('time_user_id')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { candidato: true }
        });

        if (!user || user.tipo !== 'CANDIDATO' || !user.candidato) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const candidatoId = user.candidato.id;
        const body = await request.json();
        const { propostaId, action } = body;
        const justification = typeof body.justification === 'string'
            ? body.justification.trim().slice(0, 1000) || null
            : null;

        if (!propostaId || !['ACEITAR', 'RECUSAR'].includes(action)) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

        const proposta = await (prisma as any).proposta.findUnique({
            where: { id: propostaId },
        });

        if (!proposta || proposta.candidato_id !== candidatoId) {
            return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
        }

        if (proposta.status !== 'PENDENTE_CANDIDATO') {
            return NextResponse.json({ error: 'Esta proposta já foi respondida' }, { status: 400 });
        }

        const newStatus = action === 'ACEITAR' ? 'ACEITA' : 'RECUSADA';

        await (prisma as any).proposta.update({
            where: { id: propostaId },
            data: {
                status: newStatus,
                atualizado_em: new Date(),
            }
        });

        // Atualizar status no breakdown
        const application = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id: proposta.vaga_id,
                    candidato_id: candidatoId
                }
            }
        });

        if (application && application.breakdown) {
            const breakdown = JSON.parse(application.breakdown as string);
            if (breakdown.finalDecision) {
                breakdown.finalDecision.status = newStatus;
                if (justification) {
                    breakdown.finalDecision.candidateJustification = justification;
                }
                await prisma.vaga_avaliacao.update({
                    where: { id: application.id },
                    data: { breakdown: JSON.stringify(breakdown) }
                });
            }
        }

        // Buscar dados da vaga para a notificação
        const vaga = await prisma.vaga.findUnique({
            where: { id: proposta.vaga_id },
            select: { cargo: true, uuid: true }
        });

        // Buscar empresa para notificação
        const empresa = await prisma.empresa.findUnique({
            where: { id: proposta.empresa_id },
            include: { usuario: true }
        });

        // Enviar notificação para a empresa
        const candidateName = user.candidato.nome + (user.candidato.sobrenome ? ` ${user.candidato.sobrenome}` : '');
        const vagaCargo = vaga?.cargo || 'vaga';
        const title = action === 'ACEITAR' ? 'Proposta Aceita!' : 'Proposta Recusada';
        const message = action === 'ACEITAR'
            ? `O candidato ${candidateName} aceitou sua proposta para a vaga ${vagaCargo}.`
            : `O candidato ${candidateName} recusou sua proposta para a vaga ${vagaCargo}.`;

        if (empresa?.usuario?.id) {
            await (prisma as any).notificacao.create({
                data: {
                    usuario_id: empresa.usuario.id,
                    titulo: title,
                    mensagem: message,
                    tipo: action === 'ACEITAR' ? 'PROPOSTA_ACEITA' : 'PROPOSTA_RECUSADA',
                    dados: JSON.stringify({
                        vagaId: proposta.vaga_id,
                        candidatoId: candidatoId,
                        vacancyTitle: vagaCargo,
                        candidateName: candidateName
                    })
                }
            });
        }

        if (empresa?.usuario?.email) {
            try {
                const vacancyLink = `${process.env.APP_URL}/company/vacancies/${vaga?.uuid || proposta.vaga_id}/ranking`;
                await sendProposalResponseToCompanyEmail(
                    empresa.usuario.email,
                    empresa.nome_empresa,
                    candidateName,
                    vagaCargo,
                    action === 'ACEITAR',
                    vacancyLink,
                    justification
                );
            } catch (emailErr) {
                console.error('Warning: failed to send proposal response email to company:', emailErr);
            }
        }

        return NextResponse.json({ success: true, status: newStatus });
    } catch (error) {
        console.error('Error handling proposal decision:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
