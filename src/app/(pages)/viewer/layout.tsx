import { cookies } from "next/headers";
import { PublicProfileBanner } from "./_components/PublicProfileBanner";
import { parseSessionValue } from "@/src/lib/session";

export default async function ViewerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const isLoggedIn = !!parseSessionValue(parseSessionValue(cookieStore.get("time_user_id")?.value));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <PublicProfileBanner isLoggedIn={isLoggedIn} />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
