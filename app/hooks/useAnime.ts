"use client";

import { useCallback } from "react";
import { Anime } from "@/types/anime";
import * as animeService from "@/services/animeService";
import { BrowseSortType } from "@/services/animeService";
import { useLoading } from "@/contexts/LoadingContext";

export type { BrowseSortType };

export function useAnime() {
    const { withLoading, setLoading } = useLoading();

    const getAnimeById = useCallback(
        async (id: number): Promise<Anime | null> => {
            return withLoading(() => animeService.getAnimeById(id));
        },
        [withLoading],
    );

    const browseAnime = useCallback(
        async (
            limit: number = 20,
            offset: number = 0,
            sort: BrowseSortType = "rating",
            hideSpecials: boolean = false,
        ): Promise<{ anime: Anime[]; total: number }> => {
            return withLoading(() => animeService.browseAnime(limit, offset, sort, hideSpecials));
        },
        [withLoading],
    );

    const getHomePageAnime = useCallback(async (): Promise<{ featured: Anime[]; popular: Anime[] }> => {
        return withLoading(() => animeService.getHomePageAnime());
    }, [withLoading]);

    const searchAnime = useCallback(
        async (query: string, limit: number = 20, hideSpecials: boolean = false): Promise<Anime[]> => {
            return withLoading(() => animeService.searchAnime(query, limit, hideSpecials));
        },
        [withLoading],
    );

    const getAnimeByIdSilent = useCallback(async (id: number): Promise<Anime | null> => {
        return animeService.getAnimeById(id);
    }, []);

    const browseAnimeSilent = useCallback(
        async (
            limit: number = 20,
            offset: number = 0,
            sort: BrowseSortType = "rating",
            hideSpecials: boolean = false,
        ): Promise<{ anime: Anime[]; total: number }> => {
            return animeService.browseAnime(limit, offset, sort, hideSpecials);
        },
        [],
    );

    const getHomePageAnimeSilent = useCallback(async (): Promise<{ featured: Anime[]; popular: Anime[] }> => {
        return animeService.getHomePageAnime();
    }, []);

    const searchAnimeSilent = useCallback(
        async (query: string, limit: number = 20, hideSpecials: boolean = false): Promise<Anime[]> => {
            return animeService.searchAnime(query, limit, hideSpecials);
        },
        [],
    );

    return {
        // With global loading spinner
        getAnimeById,
        browseAnime,
        getHomePageAnime,
        searchAnime,
        // Without global loading spinner (for inline loading states)
        getAnimeByIdSilent,
        browseAnimeSilent,
        getHomePageAnimeSilent,
        searchAnimeSilent,
        // Direct access to loading control
        setLoading,
        withLoading,
    };
}
