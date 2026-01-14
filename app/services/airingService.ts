import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { fetchAiringScheduleFromAniList } from "@/lib/anilist";
import { AiringInfo, AiringScheduleResponse } from "@/types/airing";

async function storeAiredEpisodes(episodes: AiringInfo[]): Promise<void> {
    const redis = getRedis();
    const now = Math.floor(Date.now() / 1000);

    const airedEpisodes = episodes.filter(ep => ep.airingAt <= now);
    if (airedEpisodes.length === 0) {
        return;
    }

    try {
        const existing = await redis.get(REDIS_KEYS.AIRED_RECENTLY);
        const existingMap = new Map<string, AiringInfo>();

        if (existing) {
            const parsed = JSON.parse(existing) as AiringInfo[];
            for (const ep of parsed) {
                existingMap.set(`${ep.malId}-${ep.episode}`, ep);
            }
        }

        for (const ep of airedEpisodes) {
            existingMap.set(`${ep.malId}-${ep.episode}`, ep);
        }

        const merged = Array.from(existingMap.values());

        await redis.setex(REDIS_KEYS.AIRED_RECENTLY, REDIS_TTL.AIRED_RECENTLY, JSON.stringify(merged));
    } catch {}
}

async function getAiredToday(): Promise<AiringInfo[]> {
    const redis = getRedis();

    try {
        const cached = await redis.get(REDIS_KEYS.AIRED_RECENTLY);
        if (cached) {
            return JSON.parse(cached) as AiringInfo[];
        }
    } catch {}

    return [];
}

export async function getAiringSchedule(): Promise<AiringScheduleResponse> {
    const redis = getRedis();
    let airing: AiringInfo[];
    let fetchedAt: string;

    try {
        const cached = await redis.get(REDIS_KEYS.AIRING_SCHEDULE);
        if (cached) {
            const parsed = JSON.parse(cached) as { airing: AiringInfo[]; fetchedAt: string };
            airing = parsed.airing;
            fetchedAt = parsed.fetchedAt;
            await storeAiredEpisodes(airing);
        } else {
            airing = await fetchAiringScheduleFromAniList(3);
            fetchedAt = new Date().toISOString();
            await storeAiredEpisodes(airing);
            await redis.setex(
                REDIS_KEYS.AIRING_SCHEDULE,
                REDIS_TTL.AIRING_SCHEDULE,
                JSON.stringify({ airing, fetchedAt }),
            );
        }
    } catch (error) {
        console.error("[AiringService] error:", error);
        try {
            airing = await fetchAiringScheduleFromAniList(3);
            fetchedAt = new Date().toISOString();
            await storeAiredEpisodes(airing);
        } catch (anilistError) {
            console.error("[AiringService] AniList fallback failed:", anilistError);
            airing = [];
            fetchedAt = new Date().toISOString();
        }
    }

    const airedToday = await getAiredToday();

    return {
        airing,
        airedToday,
        fetchedAt,
    };
}
