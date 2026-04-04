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
