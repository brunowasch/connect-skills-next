"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function selectVacancyForRanking(vacancyId: string) {
    const cookieStore = await cookies();
    cookieStore.set("vacancy_ranking_id", vacancyId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    redirect("/company/vacancies/ranking");
}

export async function selectVacancyForEditing(vacancyId: string) {
    const cookieStore = await cookies();
    cookieStore.set("editing_vacancy_id", vacancyId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
    });

    redirect("/company/vacancies/edit");
}
