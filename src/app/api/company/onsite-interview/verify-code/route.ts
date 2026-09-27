import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { parseSessionValue } from "@/src/lib/session";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = parseSessionValue(cookieStore.get("time_user_id")?.value);
        if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const empresa = await prisma.empresa.findUnique({
            where: { usuario_id: userId }
        });
        if (!empresa) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

        const { entrevistaId, codigo } = await req.json();
        if (!entrevistaId || !codigo) {
            return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
        }

        const entrevista = await (prisma as any).entrevista_presencial.findUnique({
            where: { id: entrevistaId }
        });

        if (!entrevista) return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });
        if (entrevista.empresa_id !== empresa.id) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

        if (entrevista.status !== "CONFIRMADA") {
            return NextResponse.json({ error: "A entrevista não está confirmada." }, { status: 400 });
        }

        if (entrevista.candidato_compareceu) {
            return NextResponse.json({ error: "Presença já confirmada anteriormente." }, { status: 400 });
        }

        if (entrevista.codigo_participacao !== codigo.trim().toUpperCase()) {
            return NextResponse.json({ error: "Código inválido." }, { status: 400 });
        }

        await (prisma as any).entrevista_presencial.update({
            where: { id: entrevistaId },
            data: {
                candidato_compareceu: true,
                status: "CONCLUIDA"
            }
        });

        const candidato = await prisma.candidato.findUnique({
            where: { id: entrevista.candidato_id },
            include: { usuario: { select: { id: true } } }
        });

        const vaga = await prisma.vaga.findUnique({
            where: { id: entrevista.vaga_id },
            select: { cargo: true }
        });

        if (candidato?.usuario) {
            await (prisma as any).notificacao.create({
                data: {
                    id: randomUUID(),
                    usuario_id: candidato.usuario.id,
                    tipo: "ENTREVISTA_PRESENCIAL_CONCLUIDA",
                    titulo: "Presença Confirmada!",
                    mensagem: `A empresa ${empresa.nome_empresa} confirmou sua presença na entrevista presencial para a vaga de "${vaga?.cargo || "a vaga"}". Parabéns por comparecer!`,
                    dados: JSON.stringify({ entrevistaId, vagaId: entrevista.vaga_id, vacancyTitle: vaga?.cargo || "a vaga" }),
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/company/onsite-interview/verify-code:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
