import Image from "next/image";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="flex flex-row items-center justify-center bg-[#F9FAFB] p-4 px-3">
            <Link href="/pages/candidate/candidateApp/dashboard"><Image src="/img/logos/icon.png" alt="Connect Skills" width={20} height={20} priority style={{ height: "auto", width: "2rem" }} /></Link>
            <p className="text-sm text-gray-500">© 2026 Connect Skills.</p>
            <Link href="/terms" className="text-sm text-gray-500 px-2 hover:text-blue-500 hover:underline">Termos de Uso</Link>
            <Link href="/privacy" className="text-sm text-gray-500 px-2 hover:text-blue-500 hover:underline">Política de Privacidade</Link>
            <Link href="/cookies" className="text-sm text-gray-500 px-2 hover:text-blue-500 hover:underline">Política de Cookies</Link>
            <Link href="/help" className="text-sm text-gray-500 px-2 hover:text-blue-500 hover:underline">Ajuda</Link>
            <Link href="/contact" className="text-sm text-gray-500 px-2 hover:text-blue-500 hover:underline">Contato</Link>
        </footer>
    )
}