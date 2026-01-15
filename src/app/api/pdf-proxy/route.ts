import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        let url = request.nextUrl.searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 });
        }

        // Valida que é uma URL do Cloudinary
        if (!url.includes('cloudinary.com')) {
            return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
        }

        // Remove parâmetros de autenticação problemáticos que causam 401
        try {
            const urlObj = new URL(url);
            // Remove parâmetros que podem causar erro de autenticação
            urlObj.searchParams.delete('_a');
            urlObj.searchParams.delete('signature');
            urlObj.searchParams.delete('api_key');
            url = urlObj.toString();
        } catch (e) {
            console.warn('[PDF Proxy] Erro ao limpar URL, usando original:', e);
        }

        console.log('[PDF Proxy] URL original recebida');
        console.log('[PDF Proxy] URL limpa para fetch:', url);

        // Faz requisição ao Cloudinary
        const response = await fetch(url);

        if (!response.ok) {
            console.error('[PDF Proxy] Erro ao buscar:', response.status, response.statusText);

            // Se ainda der erro 401, tenta remover completamente a versão da URL
            if (response.status === 401) {
                try {
                    console.log('[PDF Proxy] Tentando sem versão...');
                    const cleanUrl = url.replace(/\/v\d+\//, '/');
                    console.log('[PDF Proxy] URL sem versão:', cleanUrl);

                    const retryResponse = await fetch(cleanUrl);
                    if (retryResponse.ok) {
                        const blob = await retryResponse.blob();
                        const arrayBuffer = await blob.arrayBuffer();

                        console.log('[PDF Proxy] Sucesso sem versão:', {
                            size: arrayBuffer.byteLength,
                            type: blob.type
                        });

                        // Determina o Content-Type correto
                        let contentType = blob.type;
                        if (!contentType || contentType === 'application/octet-stream' || contentType === 'binary/octet-stream') {
                            contentType = 'application/pdf';
                        }

                        return new NextResponse(arrayBuffer, {
                            headers: {
                                'Content-Type': contentType,
                                'Content-Length': arrayBuffer.byteLength.toString(),
                                'Content-Disposition': 'inline; filename="documento.pdf"',
                                'Cache-Control': 'public, max-age=31536000, immutable',
                            },
                        });
                    }
                } catch (retryError) {
                    console.error('[PDF Proxy] Retry também falhou:', retryError);
                }
            }

            return NextResponse.json(
                { error: `Erro ao buscar arquivo: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        // Obtém o blob do arquivo
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        console.log('[PDF Proxy] Arquivo obtido com sucesso:', {
            size: arrayBuffer.byteLength,
            type: blob.type
        });

        // Determina o Content-Type correto
        let contentType = blob.type;
        if (!contentType || contentType === 'application/octet-stream' || contentType === 'binary/octet-stream') {
            contentType = 'application/pdf';
        }

        console.log('[PDF Proxy] Usando Content-Type:', contentType);

        // Retorna o arquivo com os headers corretos
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': arrayBuffer.byteLength.toString(),
                'Content-Disposition': 'inline; filename="documento.pdf"', // Filename ajuda o navegador a identificar
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('[PDF Proxy] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao processar arquivo' },
            { status: 500 }
        );
    }
}
