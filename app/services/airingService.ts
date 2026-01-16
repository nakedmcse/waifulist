import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { fetchAiringSchedules } from "@/lib/anilist";
import { AiringScheduleResponse } from "@/types/airing";

export async function getAiringSchedule(): Promise<AiringScheduleResponse> {
    const redis = getRedis();

    try {
        const cached = await redis.get(REDIS_KEYS.AIRING_SCHEDULE);
        if (cached) {
            return JSON.parse(cached) as AiringScheduleResponse;
        }

        const { airing, airedToday } = await fetchAiringSchedules();
        const fetchedAt = new Date().toISOString();
        const result: AiringScheduleResponse = { airing, airedToday, fetchedAt };

        await redis.setex(REDIS_KEYS.AIRING_SCHEDULE, REDIS_TTL.AIRING_SCHEDULE, JSON.stringify(result));

        return result;
    } catch (error) {
        console.error("[AiringService] error:", error);
        try {
            const { airing, airedToday } = await fetchAiringSchedules();
            return { airing, airedToday, fetchedAt: new Date().toISOString() };
        } catch (anilistError) {
            console.error("[AiringService] AniList fallback failed:", anilistError);
            return { airing: [], airedToday: [], fetchedAt: new Date().toISOString() };
        }
    }
}
