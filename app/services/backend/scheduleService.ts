import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { fetchUpcomingAiringSchedule } from "@/lib/anilist";
import { ScheduleResponse } from "@/types/schedule";

export async function getSchedule(): Promise<ScheduleResponse> {
    const redis = getRedis();

    try {
        const cached = await redis.get(REDIS_KEYS.SCHEDULE);
        if (cached) {
            return JSON.parse(cached) as ScheduleResponse;
        }
    } catch (error) {
        console.error("[ScheduleService] Failed to get cached schedule:", error);
    }

    try {
        const airing = await fetchUpcomingAiringSchedule();

        const response: ScheduleResponse = {
            airing,
            lastUpdated: new Date().toISOString(),
        };

        await redis.setex(REDIS_KEYS.SCHEDULE, REDIS_TTL.SCHEDULE, JSON.stringify(response));

        return response;
    } catch (error) {
        console.error("[ScheduleService] Failed to fetch schedule:", error);
        return {
            airing: [],
            lastUpdated: new Date().toISOString(),
        };
    }
}

export async function refreshSchedule(): Promise<ScheduleResponse> {
    const redis = getRedis();
    await redis.del(REDIS_KEYS.SCHEDULE);
    return getSchedule();
}
