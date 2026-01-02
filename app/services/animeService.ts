import { Anime } from "@/types/anime";
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
): Promise<{ anime: Anime[]; total: number }> {
    try {
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            sort,
            hideSpecials: String(hideSpecials),
        });
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

export async function getHomePageAnime(): Promise<{ featured: Anime[]; popular: Anime[] }> {
    try {
        const response = await fetch("/api/anime?home=true");
        if (!response.ok) {
            return { featured: [], popular: [] };
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch homepage anime:", error);
        return { featured: [], popular: [] };
    }
}

export async function searchAnime(query: string, limit: number = 20, hideSpecials: boolean = false): Promise<Anime[]> {
    try {
        const params = new URLSearchParams({
            q: query,
            limit: String(limit),
            hideSpecials: String(hideSpecials),
        });
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
