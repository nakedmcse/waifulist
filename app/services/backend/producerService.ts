import { cache } from "react";
import { Anime } from "@/types/anime";
import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { ProducerAnimeEntry, scrapeProducerAnime } from "@/services/backend/scraper";
import { getAnimeById, getAnimeFromRedisByIds } from "@/services/backend/animeData";

export interface ProducerAnimeResult {
    entries: ProducerAnimeEntry[];
    animeList: Anime[];
}

async function getProducerAnimeInternal(producerId: number): Promise<ProducerAnimeResult> {
    const redis = getRedis();
    const cacheKey = REDIS_KEYS.PRODUCER_ANIME(producerId);

    let entries: ProducerAnimeEntry[] = [];

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            entries = JSON.parse(cached) as ProducerAnimeEntry[];
        }
    } catch (error) {
        console.error(`[ProducerService] Redis get failed for producer ${producerId}:`, error);
    }

    if (entries.length === 0) {
        entries = await scrapeProducerAnime(producerId);

        if (entries.length > 0) {
            try {
                await redis.setex(cacheKey, REDIS_TTL.PRODUCER_ANIME, JSON.stringify(entries));
            } catch (error) {
                console.error(`[ProducerService] Redis set failed for producer ${producerId}:`, error);
            }
        }
    }

    if (entries.length === 0) {
        return { entries: [], animeList: [] };
    }

    const animeIds = entries.map(e => e.mal_id);
    const animeMapFromRedis = await getAnimeFromRedisByIds(animeIds);
    const animeList: Anime[] = [];

    for (const entry of entries) {
        let anime = animeMapFromRedis.get(entry.mal_id);
        if (!anime) {
            anime = (await getAnimeById(entry.mal_id, false, false)) ?? undefined;
        }

        if (anime) {
            animeList.push(anime);
        }
    }

    return { entries, animeList };
}

export const getProducerAnime = cache(getProducerAnimeInternal);
