"use client";

import { useCallback } from "react";
import { Anime } from "@/types/anime";
import * as animeService from "@/services/animeService";
import { useLoading } from "@/contexts/LoadingContext";

export function useAnime() {
    const { withLoading, setLoading } = useLoading();

    const getAnimeById = useCallback(
        async (id: number): Promise<Anime | null> => {
            return withLoading(() => animeService.getAnimeById(id));
        },
        [withLoading],
    );

    const getAnimeBatch = useCallback(
        async (ids: number[]): Promise<Map<number, Anime>> => {
            return withLoading(() => animeService.getAnimeBatch(ids));
        },
        [withLoading],
    );

    const getPopularAnime = useCallback(
        async (limit: number = 20, offset: number = 0): Promise<{ anime: Anime[]; total: number }> => {
            return withLoading(() => animeService.getPopularAnime(limit, offset));
        },
        [withLoading],
    );

    const getHomePageAnime = useCallback(async (): Promise<{ featured: Anime[]; popular: Anime[] }> => {
        return withLoading(() => animeService.getHomePageAnime());
    }, [withLoading]);

    const searchAnime = useCallback(
        async (query: string, limit: number = 20): Promise<Anime[]> => {
            return withLoading(() => animeService.searchAnime(query, limit));
        },
        [withLoading],
    );

    // Non-loading variants for cases where you don't want the global spinner
    const getAnimeByIdSilent = useCallback(async (id: number): Promise<Anime | null> => {
        return animeService.getAnimeById(id);
    }, []);

    const getAnimeBatchSilent = useCallback(async (ids: number[]): Promise<Map<number, Anime>> => {
        return animeService.getAnimeBatch(ids);
    }, []);

    const getPopularAnimeSilent = useCallback(
        async (limit: number = 20, offset: number = 0): Promise<{ anime: Anime[]; total: number }> => {
            return animeService.getPopularAnime(limit, offset);
        },
        [],
    );

    const getHomePageAnimeSilent = useCallback(async (): Promise<{ featured: Anime[]; popular: Anime[] }> => {
        return animeService.getHomePageAnime();
    }, []);

    const searchAnimeSilent = useCallback(async (query: string, limit: number = 20): Promise<Anime[]> => {
        return animeService.searchAnime(query, limit);
    }, []);

    return {
        // With global loading spinner
        getAnimeById,
        getAnimeBatch,
        getPopularAnime,
        getHomePageAnime,
        searchAnime,
        // Without global loading spinner (for inline loading states)
        getAnimeByIdSilent,
        getAnimeBatchSilent,
        getPopularAnimeSilent,
        getHomePageAnimeSilent,
        searchAnimeSilent,
        // Direct access to loading control
        setLoading,
        withLoading,
    };
}
