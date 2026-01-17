"use client";

import { useState, useEffect } from "react";

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("candidate_favorites");
        if (stored) {
            try {
                setFavorites(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
    }, []);

    const toggleFavorite = (vagaId: string) => {
        const newFavorites = favorites.includes(vagaId)
            ? favorites.filter((id) => id !== vagaId)
            : [...favorites, vagaId];

        setFavorites(newFavorites);
        localStorage.setItem("candidate_favorites", JSON.stringify(newFavorites));

        document.cookie = `favorite_vacancies=${JSON.stringify(newFavorites)}; path=/; max-age=31536000; SameSite=Lax`;
    };

    const isFavorite = (vagaId: string) => favorites.includes(vagaId);

    return { favorites, toggleFavorite, isFavorite };
}
