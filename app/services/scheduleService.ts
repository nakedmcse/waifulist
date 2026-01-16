import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { fetchUpcomingAiringSchedule } from "@/lib/anilist";
import { AiringInfo } from "@/types/airing";
import { DayOfWeek, DAYS_OF_WEEK, ScheduleAnime, ScheduleByDay, ScheduleResponse } from "@/types/schedule";

function createEmptySchedule(): ScheduleByDay {
    const schedule: ScheduleByDay = {} as ScheduleByDay;
    for (const day of DAYS_OF_WEEK) {
        schedule[day] = [];
    }
    return schedule;
}

function getDayOfWeek(timestamp: number): DayOfWeek {
    const date = new Date(timestamp * 1000);
    const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
}

function airingInfoToScheduleAnime(info: AiringInfo): ScheduleAnime {
    return {
        mal_id: info.malId,
        title: info.title,
        title_english: info.titleEnglish ?? undefined,
        images: {
            jpg: {
                image_url: info.coverImage,
                small_image_url: info.coverImage,
                large_image_url: info.coverImage,
            },
            webp: {
                image_url: info.coverImage,
                small_image_url: info.coverImage,
                large_image_url: info.coverImage,
            },
        },
        status: "Currently Airing",
    };
}

function groupByLocalDay(airingList: AiringInfo[]): ScheduleByDay {
    const schedule = createEmptySchedule();
    const seen = new Set<number>();

    for (const info of airingList) {
        if (seen.has(info.malId)) {
            continue;
        }
        seen.add(info.malId);

        const day = getDayOfWeek(info.airingAt);
        schedule[day].push(airingInfoToScheduleAnime(info));
    }

    return schedule;
}

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
        const schedule = groupByLocalDay(airing);

        const response: ScheduleResponse = {
            schedule,
            lastUpdated: new Date().toISOString(),
        };

        await redis.setex(REDIS_KEYS.SCHEDULE, REDIS_TTL.SCHEDULE, JSON.stringify(response));

        return response;
    } catch (error) {
        console.error("[ScheduleService] Failed to fetch schedule:", error);
        return {
            schedule: createEmptySchedule(),
            lastUpdated: new Date().toISOString(),
        };
    }
}

export async function refreshSchedule(): Promise<ScheduleResponse> {
    const redis = getRedis();
    await redis.del(REDIS_KEYS.SCHEDULE);
    return getSchedule();
}
