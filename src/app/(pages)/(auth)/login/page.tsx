import { Header, Footer } from "@/src/app/_components/Layout/index"
import { LoginCard } from "./_components/LoginCard"
import { Suspense } from "react"

export default function Login() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                </div>
            }>
                <LoginCard />
            </Suspense>
            <Footer />
        </>
    )
}