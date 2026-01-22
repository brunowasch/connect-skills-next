"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

let globalFavorites: string[] | null = null;
let isFetchingGlobal = false;
const subscribers: Array<(favs: string[]) => void> = [];

export function useFavorites() {
    const { t } = useTranslation();
    const router = useRouter();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const syncFavorites = async () => {
        if (globalFavorites !== null) {
            setFavorites(globalFavorites);
            setIsInitialized(true);
            return;
        }

        if (isFetchingGlobal) {
            subscribers.push((favs) => {
                setFavorites(favs);
                setIsInitialized(true);
            });
            return;
        }

        isFetchingGlobal = true;
        try {
            const res = await fetch('/api/candidate/favorites');
            if (res.ok) {
                const data = await res.json();
                globalFavorites = data;
                setFavorites(data);
                // Update cookie to match DB
                document.cookie = `favorite_vacancies=${JSON.stringify(data)}; path=/; max-age=31536000; SameSite=Lax`;

                subscribers.forEach(sub => sub(data));
                subscribers.length = 0;
            }
        } catch (error) {
            console.error("Failed to sync favorites", error);
        } finally {
            isFetchingGlobal = false;
            setIsInitialized(true);
        }
    };

    const loadFavoritesFromCookie = () => {
        const match = document.cookie.match(/favorite_vacancies=([^;]+)/);
        if (match) {
            try {
                const decoded = decodeURIComponent(match[1]);
                setFavorites(JSON.parse(decoded));
            } catch (e) {
                console.error("Failed to parse favorites cookie", e);
            }
        }
        setIsInitialized(true);
    };

    useEffect(() => {
        syncFavorites();

        const handleUpdate = () => loadFavoritesFromCookie();
        window.addEventListener('favorites-updated', handleUpdate);

        return () => {
            window.removeEventListener('favorites-updated', handleUpdate);
        };
    }, []);

    const toggleFavorite = async (vagaId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/candidate/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vagaId }),
            });

            if (!response.ok) throw new Error('Failed to toggle favorite');

            const data = await response.json();

            // Re-fetch or update local state/cookie
            // The server will update the cookie if we re-fetch the page, 
            // but for immediate UI response we can update local state
            const newFavorites = favorites.includes(vagaId)
                ? favorites.filter(id => id !== vagaId)
                : [...favorites, vagaId];

            setFavorites(newFavorites);
            globalFavorites = newFavorites;
            // Sync cookie manually for next SSR
            document.cookie = `favorite_vacancies=${JSON.stringify(newFavorites)}; path=/; max-age=31536000; SameSite=Lax`;

            window.dispatchEvent(new CustomEvent('favorites-updated'));
            router.refresh();
            if (newFavorites.includes(vagaId)) {
                toast.success(t('vacancy_saved_favorites'));
            } else {
                toast.info(t('vacancy_removed_favorites'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('error_updating_favorites'));
        } finally {
            setIsLoading(false);
        }
        setIsInitialized(true);
    };

    const isFavorite = (vagaId: string) => favorites.includes(vagaId);

    return { favorites, toggleFavorite, isFavorite, count: favorites.length, isLoading, isInitialized };
}
