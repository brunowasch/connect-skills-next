import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { sendOnsiteInterviewScheduledEmail } from "@/src/lib/mail";
import { isOnsiteSlotPast, isOnsiteAddressComplete, formatOnsiteAddress, OnsiteAddress } from "@/src/lib/onsite-slot";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("time_user_id")?.value;
        if (!userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

        const empresa = await prisma.empresa.findUnique({
            where: { usuario_id: userId },
            include: { usuario: { select: { email: true } } }
        });
        if (!empresa) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

        const { slotId, candidatoId, vagaId, endereco } = await req.json();
        if (!slotId || !candidatoId || !vagaId) {
            return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
        }

        const address: OnsiteAddress = {
            cep: String(endereco?.cep ?? "").trim(),
            logradouro: String(endereco?.logradouro ?? "").trim(),
            numero: String(endereco?.numero ?? "").trim(),
            complemento: String(endereco?.complemento ?? "").trim(),
            bairro: String(endereco?.bairro ?? "").trim(),
            cidade: String(endereco?.cidade ?? "").trim(),
            estado: String(endereco?.estado ?? "").trim().toUpperCase(),
        };
        if (!isOnsiteAddressComplete(address)) {
            return NextResponse.json({ error: "Preencha o endereço completo da entrevista." }, { status: 400 });
        }
        const cepDigits = address.cep.replace(/\D/g, "");
        address.cep = `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`;

        const slot = await (prisma as any).entrevista_presencial_slot.findUnique({
            where: { id: slotId },
            include: { entrevista_presencial: true }
        });

        if (!slot) return NextResponse.json({ error: "Slot não encontrado." }, { status: 404 });
        if (slot.empresa_id !== empresa.id) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        if (slot.entrevista_presencial) {
            return NextResponse.json({ error: "Este horário já está reservado." }, { status: 400 });
        }
        if (isOnsiteSlotPast(slot.data, slot.hora_inicio)) {
            return NextResponse.json({ error: "Este horário já passou." }, { status: 400 });
        }

        const candidato = await prisma.candidato.findUnique({
            where: { id: candidatoId },
            include: { usuario: { select: { id: true, email: true } } }
        });
        if (!candidato || !candidato.usuario) {
            return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
        }

        const entrevista = await (prisma as any).entrevista_presencial.create({
            data: {
                id: randomUUID(),
                slot_id: slotId,
                vaga_id: vagaId,
                empresa_id: empresa.id,
                candidato_id: candidatoId,
                status: "PENDENTE_CANDIDATO",
                endereco_cep: address.cep,
                endereco_logradouro: address.logradouro.slice(0, 255),
                endereco_numero: address.numero.slice(0, 20),
                endereco_complemento: address.complemento.slice(0, 100) || null,
                endereco_bairro: address.bairro.slice(0, 100),
                endereco_cidade: address.cidade.slice(0, 100),
                endereco_estado: address.estado.slice(0, 2),
            }
        });
        const formattedAddress = formatOnsiteAddress(entrevista);
        const addressText = formattedAddress ? `${formattedAddress.line1}, ${formattedAddress.line2}` : "";

        const vaga = await prisma.vaga.findUnique({ where: { id: vagaId } });
        const [dayStr, monthStr, yearStr] = slot.data.split("-").reverse();
        const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;

        await prisma.notificacao.create({
            data: {
                id: randomUUID(),
                usuario_id: candidato.usuario.id,
                tipo: "ENTREVISTA_PRESENCIAL_AGENDADA",
                titulo: "Convite para Entrevista Presencial",
                mensagem: `A empresa "${empresa.nome_empresa}" convocou você para uma entrevista presencial para a vaga de "${vaga?.cargo || "a vaga"}". Data: ${formattedDate}, às ${slot.hora_inicio}. Local: ${addressText}. Confirme sua presença!`,
                dados: JSON.stringify({ entrevistaId: entrevista.id, vagaId, slotId }),
            }
        });

        const baseUrl = process.env.APP_URL || "http://localhost:3000";
        const confirmLink = `${baseUrl}/candidate/interviews/onsite/${entrevista.id}/confirm`;

        await sendOnsiteInterviewScheduledEmail(
            candidato.usuario.email,
            candidato.nome || "Candidato",
            empresa.nome_empresa,
            vaga?.cargo || "a vaga",
            formattedDate,
            slot.hora_inicio,
            confirmLink,
            addressText
        );

        return NextResponse.json({ success: true, entrevistaId: entrevista.id });
    } catch (error) {
        console.error("POST /api/company/onsite-interview:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { entrevistaId, action } = await req.json();
        if (!entrevistaId || !action) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

        const entrevista = await (prisma as any).entrevista_presencial.findUnique({
            where: { id: entrevistaId },
            include: { slot: true }
        });

        if (!entrevista) return NextResponse.json({ error: "Entrevista não encontrada." }, { status: 404 });

        if (action === "CONFIRM") {
            if (entrevista.status === "CONFIRMADA") {
                return NextResponse.json({ error: "Você já confirmou esta entrevista." }, { status: 400 });
            }
            if (entrevista.status === "CANCELADA") {
                return NextResponse.json({ error: "Esta entrevista foi recusada e não pode ser confirmada." }, { status: 400 });
            }

            const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

            await (prisma as any).entrevista_presencial.update({
                where: { id: entrevistaId },
                data: { 
                    status: "CONFIRMADA",
                    codigo_participacao: codigo 
                }
            });

            const empresa = await prisma.empresa.findUnique({
                where: { id: entrevista.empresa_id },
                include: { usuario: { select: { id: true } } }
            });
            const candidato = await prisma.candidato.findUnique({ where: { id: entrevista.candidato_id } });
            const vaga = await prisma.vaga.findUnique({ where: { id: entrevista.vaga_id } });
            const [dayStr, monthStr, yearStr] = entrevista.slot.data.split("-").reverse();
            const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;

            if (empresa?.usuario) {
                await prisma.notificacao.create({
                    data: {
                        id: randomUUID(),
                        usuario_id: empresa.usuario.id,
                        tipo: "ENTREVISTA_PRESENCIAL_CONFIRMADA",
                        titulo: "Candidato Confirmou Entrevista Presencial",
                        mensagem: `${candidato?.nome || "Candidato"} confirmou presença na entrevista presencial para a vaga "${vaga?.cargo || "a vaga"}". Data: ${formattedDate}, às ${entrevista.slot.hora_inicio}.`,
                        dados: JSON.stringify({ entrevistaId, vagaId: entrevista.vaga_id }),
                    }
                });
            }

            return NextResponse.json({ success: true, status: "CONFIRMADA" });

        } else if (action === "CANCEL") {
            if (entrevista.status === "CANCELADA") {
                return NextResponse.json({ error: "Você já recusou esta entrevista." }, { status: 400 });
            }
            if (entrevista.status === "CONFIRMADA") {
                return NextResponse.json({ error: "Entrevista já confirmada, não pode ser recusada." }, { status: 400 });
            }

            await (prisma as any).entrevista_presencial.update({
                where: { id: entrevistaId },
                data: { status: "CANCELADA" }
            });

            const empresa = await prisma.empresa.findUnique({
                where: { id: entrevista.empresa_id },
                include: { usuario: { select: { id: true } } }
            });
            const candidato = await prisma.candidato.findUnique({ where: { id: entrevista.candidato_id } });
            const vaga = await prisma.vaga.findUnique({ where: { id: entrevista.vaga_id } });

            if (empresa?.usuario) {
                await prisma.notificacao.create({
                    data: {
                        id: randomUUID(),
                        usuario_id: empresa.usuario.id,
                        tipo: "ENTREVISTA_PRESENCIAL_RECUSADA",
                        titulo: "Candidato Recusou Entrevista Presencial",
                        mensagem: `${candidato?.nome || "Candidato"} recusou o convite de entrevista presencial para a vaga "${vaga?.cargo || "a vaga"}".`,
                        dados: JSON.stringify({ entrevistaId, candidatoId: entrevista.candidato_id }),
                    }
                });
            }

            return NextResponse.json({ success: true, status: "CANCELADA" });
        }

        return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    } catch (error) {
        console.error("PATCH /api/company/onsite-interview:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const entrevistaId = searchParams.get("id");
        if (!entrevistaId) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

        const entrevista = await (prisma as any).entrevista_presencial.findUnique({
            where: { id: entrevistaId },
            include: { slot: true }
        });

        if (!entrevista) return NextResponse.json({ entrevista: null }, { status: 404 });

        const empresa = await prisma.empresa.findUnique({
            where: { id: entrevista.empresa_id },
            select: { nome_empresa: true, foto_perfil: true }
        });

        const vaga = await prisma.vaga.findUnique({
            where: { id: entrevista.vaga_id },
            select: { cargo: true }
        });

        return NextResponse.json({
            entrevista: {
                ...entrevista,
                empresa: empresa || null,
                vaga: vaga || null,
            }
        });
    } catch (error) {
        console.error("GET /api/company/onsite-interview:", error);
        return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
}
