import { Header, Footer } from "@/src/app/_components/Layout/index"
import { RegisterCompany } from "@/src/app/(pages)/company/(register)/register/_components/Register"

export default function CompanyName() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex grow items-center justify-center">
                <RegisterCompany />
            </main>
            <Footer />
        </div>
    )
}