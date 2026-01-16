import { Anime } from "@/types/anime";
import { getAnimeFromRedisByIds } from "@/services/animeData";

type HasMalId = {
    mal_id: number;
};

export async function hydrateWithCachedAnime<T extends HasMalId>(
    items: T[],
    hydrate: (item: T, cached: Anime) => boolean,
): Promise<number> {
    if (items.length === 0) {
        return 0;
    }

    const ids = items.map(item => item.mal_id);
    const animeMap = await getAnimeFromRedisByIds(ids);
    let hydratedCount = 0;

    for (const item of items) {
        const cached = animeMap.get(item.mal_id);
        if (cached && hydrate(item, cached)) {
            hydratedCount++;
        }
    }

    return hydratedCount;
}
