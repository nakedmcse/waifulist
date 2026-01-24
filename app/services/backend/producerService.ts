import { cache } from "react";
import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { ProducerAnimeEntry, scrapeProducerAnime } from "@/services/backend/scraper";

async function getProducerAnimeInternal(producerId: number): Promise<ProducerAnimeEntry[]> {
    const redis = getRedis();
    const cacheKey = REDIS_KEYS.PRODUCER_ANIME(producerId);

    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached) as ProducerAnimeEntry[];
        }
    } catch (error) {
        console.error(`[ProducerService] Redis get failed for producer ${producerId}:`, error);
    }

    const data = await scrapeProducerAnime(producerId);

    if (data.length > 0) {
        try {
            await redis.setex(cacheKey, REDIS_TTL.PRODUCER_ANIME, JSON.stringify(data));
        } catch (error) {
            console.error(`[ProducerService] Redis set failed for producer ${producerId}:`, error);
        }
    }

    return data;
}

export const getProducerAnime = cache(getProducerAnimeInternal);
