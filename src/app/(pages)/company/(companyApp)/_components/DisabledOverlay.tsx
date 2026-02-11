'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { ExpiredVideo } from '@/src/lib/companyRestrictions';

interface DisabledOverlayProps {
    expiredVideos?: ExpiredVideo[];
}

export default function DisabledOverlay({ expiredVideos }: DisabledOverlayProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isRankingPage = pathname?.includes('/ranking');
    const pendingCandidate = searchParams?.get('pendingCandidate');

    useEffect(() => {
        // Se estiver na página de ranking avaliando um candidato pendente,
        // não aplica o overlay global (o controle será feito localmente na lista)
        if (isRankingPage && pendingCandidate) {
            return;
        }

        // Adiciona classe ao body para desabilitar interações
        document.body.classList.add('company-disabled');

        // Cria seletores para permitir acesso apenas aos rankings das vagas pendentes
        // Seleciona links que contenham o UUID da vaga E "ranking" na URL
        const allowedRankingSelectors = expiredVideos
            ? expiredVideos.map(v => `:not([href*="${v.vacancyUuid}/ranking"])`).join('')
            : '';

        // Adiciona estilos globais
        const style = document.createElement('style');
        style.id = 'company-disabled-styles';
        style.textContent = `
            /* 
               Bloqueia links exceto:
               - Sidebar (.sidebar-nav-link)
               - Language Switcher (.language-switcher-btn)
               - Rankings específicos de vagas pendentes (allowedRankingSelectors)
               - Botão de avaliação (.evaluate-action-btn)
               - Logo do cabeçalho/sidebar (.header-logo-link)
            */
            .company-disabled a:not(.sidebar-nav-link):not(.language-switcher-btn):not(.evaluate-action-btn):not(.header-logo-link):not(.evaluate-video-btn)${allowedRankingSelectors} {
                pointer-events: none !important;
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }
            
            /* 
               Bloqueia botões exceto:
               - Sidebar (.sidebar-nav-link)
               - Botões de avaliação
               - Botões do banner
               - Language Switcher
               - Botão de ação (.evaluate-action-btn)
               - Menu mobile (.menu-toggle-btn)
               - Notificações (.notification-btn)
            */
            .company-disabled button:not(.sidebar-nav-link):not([class*="evaluate"]):not([class*="banner"]):not(.language-switcher-btn):not(.evaluate-action-btn):not(.menu-toggle-btn):not(.notification-btn):not(.evaluate-video-btn):not(.notification-action-btn) {
                pointer-events: none !important;
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }

            .company-disabled .notification-content {
                pointer-events: none !important;
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }
            
            .company-disabled input,
            .company-disabled textarea,
            .company-disabled select {
                pointer-events: none !important;
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.body.classList.remove('company-disabled');
            const styleElement = document.getElementById('company-disabled-styles');
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, [expiredVideos, isRankingPage, pendingCandidate]);

    return null;
}
