import { Anime, AnimeEpisode, AnimeEpisodeDetail, TopReviewWithAnime } from "@/types/anime";
import { BrowseSortType } from "@/types/filter";

export type { BrowseSortType };

export async function getAnimeById(id: number): Promise<Anime | null> {
    try {
        const response = await fetch(`/api/anime/${id}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch anime ${id}:`, error);
        return null;
    }
}

export async function browseAnime(
    limit: number = 20,
    offset: number = 0,
    sort: BrowseSortType = "rating",
    hideSpecials: boolean = false,
    genres: string[] = [],
): Promise<{ anime: Anime[]; total: number }> {
    try {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            sort,
            hideSpecials: String(hideSpecials),
        });
        if (genres.length > 0) {
            params.set("genres", genres.join(","));
        }
        const response = await fetch(`/api/anime?${params}`);
        if (!response.ok) {
            return { anime: [], total: 0 };
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to browse anime:", error);
        return { anime: [], total: 0 };
    }
}

export async function getHomePageAnime(): Promise<{ popular: Anime[]; reviews: TopReviewWithAnime[] }> {
    try {
        const response = await fetch("/api/anime?home=true");
        if (!response.ok) {
            return { popular: [], reviews: [] };
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch homepage anime:", error);
        return { popular: [], reviews: [] };
    }
}

export async function searchAnime(
    query: string,
    limit: number = 20,
    hideSpecials: boolean = false,
    genres: string[] = [],
): Promise<Anime[]> {
    try {
        const params = new URLSearchParams({
            q: query,
            limit: String(limit),
            hideSpecials: String(hideSpecials),
        });
        if (genres.length > 0) {
            params.set("genres", genres.join(","));
        }
        const response = await fetch(`/api/anime?${params}`);
        if (!response.ok) {
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

export async function getGenres(): Promise<string[]> {
    try {
        const response = await fetch("/api/genres");
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error("Failed to fetch genres:", error);
        return [];
    }
}

export async function getEpisodeDetail(animeId: number, episodeId: number): Promise<AnimeEpisodeDetail | null> {
    try {
        const response = await fetch(`/api/anime/${animeId}/episodes/${episodeId}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch episode ${episodeId} for anime ${animeId}:`, error);
        return null;
    }
}

export async function getEpisodes(
    animeId: number,
    page: number = 1,
): Promise<{ episodes: AnimeEpisode[]; hasNextPage: boolean; lastPage: number }> {
    try {
        const response = await fetch(`/api/anime/${animeId}/episodes?page=${page}`);
        if (!response.ok) {
            return { episodes: [], hasNextPage: false, lastPage: 1 };
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch episodes for anime ${animeId}:`, error);
        return { episodes: [], hasNextPage: false, lastPage: 1 };
    }
}
