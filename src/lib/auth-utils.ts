export function getRedirectTo(user: {
    tipo: string;
    candidato?: {
        nome: string | null;
        data_nascimento?: Date | null;
        candidato_area?: { candidato_id: string; area_interesse_id: number }[];
    } | null;
    empresa?: {
        nome_empresa: string | null;
    } | null;
    mentor?: {
        nome: string | null;
        mentor_area?: { mentor_id: string; area_interesse_id: number }[];
    } | null;
}): string {
    const userType = user.tipo.toUpperCase();
    let isRegistrationComplete = false;

    if (userType === "CANDIDATO") {
        const hasName = !!(user.candidato?.nome?.trim());
        const hasAreas = !!(user.candidato?.candidato_area?.length);
        isRegistrationComplete = hasName && hasAreas;
    } else if (userType === "EMPRESA") {
        isRegistrationComplete = !!(user.empresa?.nome_empresa?.trim());
    } else if (userType === "MENTOR") {
        const hasName = !!(user.mentor?.nome?.trim());
        const hasAreas = !!(user.mentor?.mentor_area?.length);
        isRegistrationComplete = hasName && hasAreas;
    }

    if (isRegistrationComplete) {
        if (userType === "CANDIDATO") return "/candidate/dashboard";
        if (userType === "EMPRESA") return "/company/dashboard";
        if (userType === "MENTOR") return "/mentor/dashboard";
    }

    if (userType === "CANDIDATO") {
        const hasName = !!(user.candidato?.nome?.trim());
        return hasName ? "/candidate/area" : "/candidate/register";
    }

    if (userType === "MENTOR") {
        const hasName = !!(user.mentor?.nome?.trim());
        return hasName ? "/mentor/specialties" : "/mentor/register";
    }

    return "/company/register";
}
