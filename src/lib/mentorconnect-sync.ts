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
            },
        });

        if (!usuario) {
            console.warn(`[MentorConnect Sync] Usuário ${usuarioId} não encontrado. Sincronização ignorada.`);
            return;
        }

        const tipo = usuario.tipo.toLowerCase();

        if (tipo !== "candidato" && tipo !== "mentor") {
            return;
        }

        const candidato = usuario.candidato;

        const payload = {
            usuario_id:    usuario.id,
            email:         usuario.email,
            senha:         usuario.senha,
            nome:          candidato?.nome       ?? usuario.nome       ?? "",
            sobrenome:     candidato?.sobrenome  ?? usuario.sobrenome  ?? "",
            tipo:          tipo,                 
            foto_perfil:   candidato?.foto_perfil ?? usuario.avatarUrl ?? null,
            cidade:        candidato?.cidade     ?? null,
            estado:        candidato?.estado     ?? null,
            pais:          candidato?.pais       ?? "Brasil",
            bio_descricao: candidato?.descricao  ?? null,
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
            console.log(`[MentorConnect Sync] Usuário ${usuarioId} sincronizado com sucesso.`);
        }
    } catch (err) {
        console.error(`[MentorConnect Sync] Erro inesperado ao sincronizar usuário ${usuarioId}:`, err);
    }
}
