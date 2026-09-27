// Horários presenciais são cadastrados no fuso de Brasília (sem horário de verão desde 2019),
// então a comparação não pode depender do fuso do servidor ou do navegador.
export function isOnsiteSlotPast(data: string, horaInicio: string, now: Date = new Date()): boolean {
    const slotStart = new Date(`${data}T${horaInicio}:00-03:00`);
    if (isNaN(slotStart.getTime())) return false;
    return slotStart <= now;
}

export interface OnsiteAddress {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export const emptyOnsiteAddress: OnsiteAddress = {
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
};

export function isOnsiteAddressComplete(a: OnsiteAddress): boolean {
    return a.cep.replace(/\D/g, "").length === 8
        && !!a.logradouro.trim() && !!a.numero.trim() && !!a.bairro.trim()
        && !!a.cidade.trim() && a.estado.trim().length === 2;
}

// Aceita tanto o objeto do formulário quanto as colunas endereco_* da entrevista.
export function formatOnsiteAddress(e: {
    endereco_logradouro?: string | null;
    endereco_numero?: string | null;
    endereco_complemento?: string | null;
    endereco_bairro?: string | null;
    endereco_cidade?: string | null;
    endereco_estado?: string | null;
    endereco_cep?: string | null;
}): { line1: string; line2: string } | null {
    if (!e.endereco_logradouro) return null;
    const line1 = [
        [e.endereco_logradouro, e.endereco_numero].filter(Boolean).join(", "),
        e.endereco_complemento,
    ].filter(Boolean).join(" - ");
    const cityState = [e.endereco_cidade, e.endereco_estado].filter(Boolean).join("/");
    const line2 = [e.endereco_bairro, cityState, e.endereco_cep && `CEP ${e.endereco_cep}`].filter(Boolean).join(" - ");
    return { line1, line2 };
}

// Data (YYYY-MM-DD) e hora (HH:mm) atuais em Brasília, para limitar os campos do formulário.
export function brasiliaNow(now: Date = new Date()): { date: string; time: string } {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Sao_Paulo",
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        }).formatToParts(now).map((p) => [p.type, p.value])
    );
    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
