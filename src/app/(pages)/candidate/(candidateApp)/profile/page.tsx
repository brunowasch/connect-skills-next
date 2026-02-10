import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CandidateProfile } from "@/src/app/(pages)/candidate/(candidateApp)/profile/_components/CandidateProfile";
import { randomUUID } from "crypto";

export default async function CandidateProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("time_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const candidate = await prisma.candidato.findUnique({
        where: { usuario_id: userId },
        include: {
            candidato_area: {
                include: {
                    area_interesse: true
                }
            },
            candidato_link: {
                orderBy: {
                    ordem: 'asc'
                }
            },
            candidato_arquivo: {
                orderBy: {
                    criadoEm: 'desc'
                }
            },
        }
    });

    if (!candidate) {
        redirect("/auth/login");
    }

    let candidateUUID = candidate.uuid;
    if (!candidateUUID) {
        candidateUUID = randomUUID();
        await prisma.candidato.update({
            where: { id: candidate.id },
            data: { uuid: candidateUUID }
        });
    }

    const localidade = candidate.cidade && candidate.estado
        ? `${candidate.cidade} - ${candidate.estado}, ${candidate.pais || 'Brasil'}`
        : candidate.cidade || candidate.estado || null;

    const rawTelefone = candidate.telefone || '';
    let ddi = '';
    let ddd = '';
    let numero = '';

    if (rawTelefone.includes('|')) {
        const parts = rawTelefone.split('|');
        ddi = parts[0].replace('+', '');
        ddd = parts[1] || '';
        numero = parts[2] || '';
    } else {
        const cleanTelefone = rawTelefone.replace(/\D/g, '');
        if (cleanTelefone.length >= 12 && cleanTelefone.startsWith('55')) {
            ddi = '55';
            ddd = cleanTelefone.substring(2, 4);
            numero = cleanTelefone.substring(4);
        } else if (cleanTelefone.length >= 10) {
            const numLen = cleanTelefone.length >= 11 ? 9 : 8;
            numero = cleanTelefone.slice(-numLen);
            ddd = cleanTelefone.slice(-numLen - 2, -numLen);
            ddi = cleanTelefone.slice(0, -numLen - 2);
        } else {
            numero = rawTelefone;
        }
    }

    // Formatar número com hífen se for celular ou fixo
    if (numero.length === 9) {
        numero = `${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
        numero = `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }

    const contato = { ddi, ddd, numero };

    const links = candidate.candidato_link.map((l: any) => ({ id: l.id, label: l.label, url: l.url, ordem: l.ordem }));

    // Buscar avaliações para filtrar anexos de vagas
    const applications = await prisma.vaga_avaliacao.findMany({
        where: {
            candidato_id: candidate.id
        },
        select: {
            breakdown: true
        }
    });

    const vacancyFileIds = new Set<string>();
    
    applications.forEach(app => {
        try {
            if (app.breakdown) {
                const breakdown = JSON.parse(app.breakdown);
                if (breakdown?.video?.fileId) {
                    vacancyFileIds.add(breakdown.video.fileId);
                }
            }
        } catch (e) {
            console.error('Error parsing breakdown:', e);
        }
    });

    const anexos = candidate.candidato_arquivo
        .filter((a: any) => !vacancyFileIds.has(a.id))
        .map((a: any) => ({
            id: a.id,
            nome: a.nome,
            url: a.url,
            mime: a.mime,
            tamanho: a.tamanho,
            criadoEm: a.criadoEm.toISOString(),
        }));

    return (
        <div className="mb-4 sm:mb-6">
            <CandidateProfile
                candidato={candidate}
                fotoPerfil={candidate.foto_perfil || undefined}
                localidade={localidade}
                contato={contato}
                links={links}
                anexos={anexos}
                perfilShareUrl={`/viewer/candidate/${candidateUUID}`}
            />
        </div>
    );
}
