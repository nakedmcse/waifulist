"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnime } from "./useAnime";

interface UseGenreFilterOptions {
    syncToUrl?: boolean;
    urlParamName?: string;
}

function getInitialGenres(syncToUrl: boolean, urlParamName: string): string[] {
    if (syncToUrl && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const genresParam = params.get(urlParamName);
        if (genresParam) {
            return genresParam.split(",").filter(g => g.trim());
        }
    }
    return [];
}

export function useGenreFilter(options: UseGenreFilterOptions = {}) {
    const { syncToUrl = true, urlParamName = "genres" } = options;
    const { getGenres } = useAnime();

    const [allGenres, setAllGenres] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>(() => getInitialGenres(syncToUrl, urlParamName));
    const [genresLoading, setGenresLoading] = useState(true);

    useEffect(() => {
        getGenres().then(genres => {
            setAllGenres(genres);
            setGenresLoading(false);
        });
    }, [getGenres]);

    const handleGenreChange = useCallback(
        (genres: string[]) => {
            window.scrollTo({ top: 0 });
            setSelectedGenres(genres);

            if (syncToUrl) {
                const url = new URL(window.location.href);
                if (genres.length > 0) {
                    url.searchParams.set(urlParamName, genres.join(","));
                } else {
                    url.searchParams.delete(urlParamName);
                }
                url.searchParams.delete("page");
                window.history.replaceState({}, "", url);
            }
        },
        [syncToUrl, urlParamName],
    );

    const clearGenres = useCallback(() => {
        handleGenreChange([]);
    }, [handleGenreChange]);

    return {
        allGenres,
        selectedGenres,
        genresLoading,
        handleGenreChange,
        clearGenres,
    };
}
