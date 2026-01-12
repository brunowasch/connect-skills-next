export interface RecentVacancyItem {
    id: string;
    title: string;
    date: Date;
    candidatesCount: number;
    status: string;
}

export interface RecentVacanciesProps {
    vacancies: RecentVacancyItem[];
}
