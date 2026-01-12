import { Header, Footer } from "@/src/app/_components/Layout/index"
import { RegisterCompany } from "@/src/app/(pages)/company/(register)/register/_components/Register"

export default function CompanyName() {
    return (
        <>
            <Header />
            <RegisterCompany />
            <Footer />
        </>
    )
}