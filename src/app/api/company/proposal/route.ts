import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { sendProposalEmail } from '@/src/lib/mail';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('time_user_id')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { tipo: true, empresa: { select: { id: true } } }
        });

        if (!user || user.tipo !== 'EMPRESA') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { candidato_id, vaga_id, vaga_uuid, status, mensagem, salario, moeda, data_inicio, modelo_trabalho, localizacao } = body;

        if (!candidato_id || !vaga_id || !status || !mensagem) {
            return NextResponse.json({ error: 'Faltam campos obrigatórios' }, { status: 400 });
        }

        const company = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
            select: { id: true, nome_empresa: true }
        });

        if (!company) {
            return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
        }

        // Buscar avaliação existente
        const dataInicioObj = data_inicio ? new Date(`${data_inicio}T00:00:00`) : null;
        if (dataInicioObj && dataInicioObj < new Date(new Date().setHours(0, 0, 0, 0))) {
            return NextResponse.json({ error: 'Data de início inválida!' }, { status: 400 });
        }

        const avaliacao = await prisma.vaga_avaliacao.findUnique({
            where: {
                vaga_id_candidato_id: {
                    vaga_id,
                    candidato_id
                }
            }
        });

        if (!avaliacao) {
            return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
        }

        const vagaParaLimite = await prisma.vaga.findUnique({
            where: { id: vaga_id },
            select: { opcao: true }
        });

        if (vagaParaLimite?.opcao) {
            try {
                const opcao = typeof vagaParaLimite.opcao === 'string'
                    ? JSON.parse(vagaParaLimite.opcao)
                    : vagaParaLimite.opcao;
                const limite = opcao?.vagas_disponiveis ? Number(opcao.vagas_disponiveis) : null;

                if (limite != null) {
                    const propostasAtivas = await (prisma as any).proposta.count({
                        where: {
                            vaga_id,
                            status: { in: ['PENDENTE_CANDIDATO', 'ACEITA'] }
                        }
                    });
                    if (propostasAtivas >= limite) {
                        return NextResponse.json({
                            error: `Limite de ${limite} proposta(s) para esta vaga já foi atingido.`
                        }, { status: 400 });
                    }
                }
            } catch { }
        }

        let breakdown = {};
        if (avaliacao.breakdown) {
            try {
                breakdown = JSON.parse(avaliacao.breakdown as string);
            } catch (e) { }
        }

        // Atualizar breakdown com a decisão final
        const finalDecision = {
            status,
            mensagem,
            sentAt: new Date().toISOString()
        };

        breakdown = {
            ...breakdown,
            finalDecision
        };

        // Salvar avaliação
        await prisma.vaga_avaliacao.update({
            where: { id: avaliacao.id },
            data: {
                breakdown: JSON.stringify(breakdown)
            }
        });

        // Se for aprovado, criar proposta
        if (status === 'APPROVED') {
            await (prisma as any).proposta.create({
                data: {
                    vaga_id,
                    candidato_id,
                    empresa_id: company.id,
                    status: 'PENDENTE_CANDIDATO',
                    salario: salario ? parseFloat(salario) : null,
                    moeda: moeda || null,
                    data_inicio: data_inicio || null,
                    modelo_trabalho: modelo_trabalho || null,
                    localizacao: localizacao || null,
                    mensagem: mensagem
                }
            });
        }

        // Buscar usuário do candidato para enviar notificação
        const candidatoInfo = await prisma.candidato.findUnique({
            where: { id: candidato_id },
            include: { usuario: true }
        });

        const vagaInfo = await prisma.vaga.findUnique({
            where: { id: vaga_id },
            select: { cargo: true, id: true, uuid: true }
        });

        // Enviar notificação real
        if (candidatoInfo?.usuario?.id && vagaInfo) {
            if (status === 'APPROVED') {
                await (prisma as any).notificacao.create({
                    data: {
                        usuario_id: candidatoInfo.usuario.id,
                        tipo: 'PROPOSTA_RECEBIDA',
                        titulo: 'Proposta Recebida!',
                        mensagem: `Parabéns! Você recebeu uma proposta para a vaga de ${vagaInfo.cargo} na empresa ${company.nome_empresa}. Confira os detalhes no seu painel.`,
                        dados: JSON.stringify({
                            vagaId: vagaInfo.id,
                            vacancyTitle: vagaInfo.cargo,
                            companyName: company.nome_empresa,
                        })
                    }
                });

                if (candidatoInfo.usuario.email) {
                    const vacancyLink = `${process.env.APP_URL}/viewer/vacancy/${vagaInfo.uuid || vagaInfo.id}`;
                    await sendProposalEmail(
                        candidatoInfo.usuario.email,
                        candidatoInfo.nome || 'Candidato',
                        company.nome_empresa,
                        vagaInfo.cargo,
                        vacancyLink,
                    ).catch(console.error);
                }
            } else {
                await (prisma as any).notificacao.create({
                    data: {
                        usuario_id: candidatoInfo.usuario.id,
                        tipo: 'DECISAO_FINAL_REPROVADO',
                        titulo: 'Atualização do Processo Seletivo',
                        mensagem: `O processo seletivo para a vaga de ${vagaInfo.cargo} na empresa ${company.nome_empresa} foi encerrado. A empresa deixou um feedback final para você.`,
                        dados: JSON.stringify({
                            vagaId: vagaInfo.id,
                            vacancyTitle: vagaInfo.cargo,
                            companyName: company.nome_empresa,
                        })
                    }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving final decision:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
