export interface Application {
    id: string;
    candidateName: string;
    candidatePhoto?: string | null;
    vacancyTitle: string;
    date: Date;
    score?: number;
    candidateId: string;
}

export interface RecentCandidatesProps {
    applications: Application[];
}