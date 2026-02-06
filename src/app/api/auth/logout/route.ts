import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();

        cookieStore.delete("time_user_id");
        cookieStore.delete("auth_mode");

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Erro ao sair." }, { status: 500 });
    }
}
