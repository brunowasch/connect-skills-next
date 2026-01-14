"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ViewerPage() {
    const searchParams = useSearchParams();
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const title = searchParams.get('title') || 'Visualizador';

    useEffect(() => {
        const url = searchParams.get('url');
        const fileKey = searchParams.get('fileKey');

        if (url) {
            setFileUrl(url);
        } else if (fileKey) {
            // Recupera o base64 do sessionStorage para arquivos recém-uploadados
            const storedFile = sessionStorage.getItem(fileKey);
            if (storedFile) setFileUrl(storedFile);
        }
    }, [searchParams]);

    if (!fileUrl) return <div className="p-10 text-center">Carregando arquivo...</div>;

    const fileType = searchParams.get('type');
    const isPdf = (fileType && fileType.includes('pdf')) || fileUrl.includes('application/pdf') || fileUrl.toLowerCase().endsWith('.pdf');

    if (isPdf) {
        // Tenta corrigir URL do Cloudinary para entrega correta de PDF se for image-resource
        let finalUrl = fileUrl;

        // Se for URL do Cloudinary e NÃO for 'raw', tentamos garantir a extensão .pdf
        if (finalUrl.includes('cloudinary.com') && !finalUrl.includes('/raw/')) {
            // Remove query params para verificar extensão limpa
            const cleanUrl = finalUrl.split('?')[0];
            if (!cleanUrl.toLowerCase().endsWith('.pdf')) {
                finalUrl += '.pdf';
            }
        }

        const isExternal = finalUrl.startsWith('http');

        // Renderiza PDF nativo via iframe (melhor compatibilidade)
        return (
            <div className="w-full h-screen bg-gray-900 flex flex-col relative group">
                <iframe
                    src={finalUrl}
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                >
                    {/* Fallback para navegadores que não suportam iframe de PDF */}
                    <div className="flex flex-col items-center justify-center h-full text-white">
                        <p>Seu navegador não suporta visualização de PDF integrada.</p>
                        <a
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            Baixar / Abrir PDF
                        </a>
                    </div>
                </iframe>

                {/* Botão flutuante para abrir em nova aba */}
                <a
                    href={finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm font-medium z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    Abrir em Nova Aba
                </a>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col">
            <div className="p-4 bg-slate-800 text-white flex justify-between">
                <h1 className="font-bold">{title}</h1>
                <button onClick={() => window.close()}>Fechar</button>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
                <img src={fileUrl} alt="Preview" className="max-w-full max-h-full" />
            </div>
        </div>
    );
}