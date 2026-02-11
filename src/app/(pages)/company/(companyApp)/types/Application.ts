export interface Application {
    id: string;
    candidateName: string;
    candidatePhoto?: string | null;
    vacancyTitle: string;
    date: Date;
    score?: number;
    candidateId: string;
    vacancyId: string;
    videoStatus?: string | null;
}

export interface RecentCandidatesProps {
    applications: Application[];
    isRestricted?: boolean;
}