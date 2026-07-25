import { prisma } from "@/src/lib/prisma";

export async function syncUserWithMentorConnect(usuarioId: string): Promise<void> {
    const syncUrl = process.env.MENTORCONNECT_SYNC_URL;
    const syncSecret = process.env.MENTORCONNECT_SYNC_SECRET;

    if (!syncUrl || !syncSecret) {
        console.warn("[MentorConnect Sync] MENTORCONNECT_SYNC_URL ou MENTORCONNECT_SYNC_SECRET não configurados. Sincronização ignorada.");
        return;
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            include: {
                candidato: true,
                empresa: true,
                mentor: true,
            },
        });

        if (!usuario) {
            console.warn(`[MentorConnect Sync] Usuário ${usuarioId} não encontrado. Sincronização ignorada.`);
            return;
        }

        const tipoOriginal = usuario.tipo.toLowerCase();
        const tipo = tipoOriginal === "empresa" ? "mentor" : tipoOriginal;

        if (tipo !== "candidato" && tipo !== "mentor") {
            return;
        }

        const candidato = usuario.candidato;
        const empresa = usuario.empresa;
        const mentor = usuario.mentor;

        let nomeFinal = candidato?.nome || empresa?.nome_empresa || mentor?.nome || usuario.nome || "";
        let sobrenomeFinal = candidato?.sobrenome || mentor?.sobrenome || usuario.sobrenome || "";
        let fotoFinal = candidato?.foto_perfil || empresa?.foto_perfil || mentor?.foto_perfil || usuario.avatarUrl || null;

        const payload = {
            usuario_id:    usuario.id,
            email:         usuario.email,
            senha:         usuario.senha,
            nome:          nomeFinal,
            sobrenome:     sobrenomeFinal,
            tipo:          tipo,                 
            foto_perfil:   fotoFinal,
            cidade:        candidato?.cidade     ?? empresa?.cidade ?? null,
            estado:        candidato?.estado     ?? empresa?.estado ?? null,
            pais:          candidato?.pais       ?? empresa?.pais ?? "Brasil",
            bio_descricao: candidato?.descricao  ?? empresa?.descricao ?? null,
        };

        const response = await fetch(syncUrl, {
            method: "POST",
            headers: {
                "Content-Type":   "application/json",
                "x-sync-secret":  syncSecret,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`[MentorConnect Sync] Falha ao sincronizar usuário ${usuarioId}. Status: ${response.status}. Body: ${body}`);
        } else {
        }
    } catch (err) {
        console.error(`[MentorConnect Sync] Erro inesperado ao sincronizar usuário ${usuarioId}:`, err);
    }
}

/**
 * Cria uma reunião no MentorConnect e retorna o link.
 * Tenta novamente uma vez em caso de falha transitória.
 * Retorna null se MENTORCONNECT_URL não estiver configurada ou se todas as tentativas falharem.
 */
export async function createMentorConnectMeeting(params: { usuarioId: string; titulo: string }): Promise<string | null> {
    const baseUrl = process.env.MENTORCONNECT_URL;

    if (!baseUrl) {
        return null;
    }

    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch(`${baseUrl}/api/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: params.usuarioId,
                    titulo: params.titulo,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.link) {
                    return data.link as string;
                }
                console.error("[MentorConnect Meeting] Resposta sem 'link':", JSON.stringify(data));
            } else {
                console.error(`[MentorConnect Meeting] Falha ao gerar reunião (tentativa ${attempt}/${maxAttempts}). Status: ${response.status}. Body: ${await response.text()}`);
            }
        } catch (err) {
            console.error(`[MentorConnect Meeting] Erro de comunicação (tentativa ${attempt}/${maxAttempts}):`, err);
        }
    }

    return null;
}

export async function deleteUserInMentorConnect(usuarioId: string): Promise<void> {
    const mentorconnectUrl = process.env.MENTORCONNECT_URL || "http://localhost:3001";
    const syncSecret = process.env.MENTORCONNECT_SYNC_SECRET;

    if (!mentorconnectUrl || !syncSecret) {
        console.warn("[MentorConnect Sync] MENTORCONNECT_URL ou MENTORCONNECT_SYNC_SECRET não configurados. Sincronização de exclusão ignorada.");
        return;
    }

    try {
        const response = await fetch(`${mentorconnectUrl}/api/delete-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-sync-secret": syncSecret,
            },
            body: JSON.stringify({ usuario_id: usuarioId }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`[MentorConnect Sync] Falha ao excluir usuário ${usuarioId} do MentorConnect. Status: ${response.status}. Body: ${body}`);
        } else {
        }
    } catch (err) {
        console.error(`[MentorConnect Sync] Erro inesperado ao excluir usuário ${usuarioId} do MentorConnect:`, err);
    }
}
