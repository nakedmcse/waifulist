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
    debugger;
    try {
        const pipeline = redis.pipeline();
        for (const ep of airedEpisodes) {
            const key = REDIS_KEYS.AIRED_RECENTLY(ep.malId, ep.episode);
            pipeline.set(key, JSON.stringify(ep), "EX", REDIS_TTL.AIRED_RECENTLY, "NX");
        }
        await pipeline.exec();
    } catch {}
}

async function getAiredRecently(): Promise<AiringInfo[]> {
    const redis = getRedis();
    const results: AiringInfo[] = [];

    try {
        let cursor = "0";
        do {
            const [nextCursor, keys] = await redis.scan(
                cursor,
                "MATCH",
                REDIS_KEYS.AIRED_RECENTLY_PATTERN,
                "COUNT",
                100,
            );
            cursor = nextCursor;

            if (keys.length > 0) {
                const values = await redis.mget(...keys);
                for (const value of values) {
                    if (value) {
                        results.push(JSON.parse(value) as AiringInfo);
                    }
                }
            }
        } while (cursor !== "0");
    } catch {}

    return results;
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

    const airedToday = await getAiredRecently();

    return {
        airing,
        airedToday,
        fetchedAt,
    };
}
