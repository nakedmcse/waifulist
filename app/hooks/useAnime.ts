"use client";

import { useCallback } from "react";
import { Anime, TopReviewWithAnime } from "@/types/anime";
import * as animeService from "@/services/frontend/animeService";
import { BrowseSortType } from "@/services/frontend/animeService";
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
            genres: string[] = [],
        ): Promise<{ anime: Anime[]; total: number }> => {
            return withLoading(() => animeService.browseAnime(limit, offset, sort, hideSpecials, genres));
        },
        [withLoading],
    );

    const getHomePageAnime = useCallback(async (): Promise<{ popular: Anime[]; reviews: TopReviewWithAnime[] }> => {
        return withLoading(() => animeService.getHomePageAnime());
    }, [withLoading]);

    const searchAnime = useCallback(
        async (
            query: string,
            limit: number = 20,
            hideSpecials: boolean = false,
            genres: string[] = [],
        ): Promise<Anime[]> => {
            return withLoading(() => animeService.searchAnime(query, limit, hideSpecials, genres));
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
            genres: string[] = [],
        ): Promise<{ anime: Anime[]; total: number }> => {
            return animeService.browseAnime(limit, offset, sort, hideSpecials, genres);
        },
        [],
    );

    const getHomePageAnimeSilent = useCallback(async (): Promise<{
        popular: Anime[];
        reviews: TopReviewWithAnime[];
    }> => {
        return animeService.getHomePageAnime();
    }, []);

    const searchAnimeSilent = useCallback(
        async (
            query: string,
            limit: number = 20,
            hideSpecials: boolean = false,
            genres: string[] = [],
        ): Promise<Anime[]> => {
            return animeService.searchAnime(query, limit, hideSpecials, genres);
        },
        [],
    );

    const getGenres = useCallback(async (): Promise<string[]> => {
        return animeService.getGenres();
    }, []);

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
        // Utilities
        getGenres,
        // Direct access to loading control
        setLoading,
        withLoading,
    };
}
