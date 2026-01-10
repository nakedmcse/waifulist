import { getRedis } from "@/lib/redis";
import { fetchScheduleFromJikan } from "@/lib/jikanApi";
import { DayFilter, DayOfWeek, DAYS_OF_WEEK, ScheduleAnime, ScheduleByDay, ScheduleResponse } from "@/types/schedule";
import { scrapeSchedule } from "./scraper";

const SCHEDULE_CACHE_KEY = "anime:schedule";
const SCHEDULE_CACHE_TTL = 60 * 60;

const WEEKDAYS: DayFilter[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function createEmptySchedule(): ScheduleByDay {
    const schedule: ScheduleByDay = {} as ScheduleByDay;
    for (const day of DAYS_OF_WEEK) {
        schedule[day] = [];
    }
    return schedule;
}

function hasData(schedule: ScheduleByDay): boolean {
    for (const day of DAYS_OF_WEEK) {
        if (schedule[day] && schedule[day].length > 0) {
            return true;
        }
    }
    return false;
}

async function fetchFromJikan(): Promise<ScheduleByDay> {
    const schedule = createEmptySchedule();

    for (const day of WEEKDAYS) {
        try {
            const animeList = await fetchScheduleFromJikan(day);
            if (animeList.length > 0) {
                schedule[day as DayOfWeek] = animeList as ScheduleAnime[];
            }
        } catch (error) {
            console.error(`[ScheduleService] Failed to fetch ${day} from Jikan:`, error);
        }
    }

    return schedule;
}

export async function getSchedule(): Promise<ScheduleResponse> {
    const redis = getRedis();

    try {
        const cached = await redis.get(SCHEDULE_CACHE_KEY);
        if (cached) {
            console.log("[ScheduleService] Returning cached schedule");
            return JSON.parse(cached) as ScheduleResponse;
        }
    } catch (error) {
        console.error("[ScheduleService] Failed to get cached schedule:", error);
    }

    let schedule = await fetchFromJikan();

    if (!hasData(schedule)) {
        console.log("[ScheduleService] Jikan returned empty, falling back to HTML scraping");
        const scraped = await scrapeSchedule();
        if (scraped) {
            schedule = scraped;
        }
    } else {
        console.log("[ScheduleService] Using Jikan data");
    }

    for (const day of DAYS_OF_WEEK) {
        if (!schedule[day]) {
            schedule[day] = [];
        }
    }

    const response: ScheduleResponse = {
        schedule,
        lastUpdated: new Date().toISOString(),
    };

    try {
        await redis.setex(SCHEDULE_CACHE_KEY, SCHEDULE_CACHE_TTL, JSON.stringify(response));
        console.log("[ScheduleService] Cached schedule");
    } catch (error) {
        console.error("[ScheduleService] Failed to cache schedule:", error);
    }

    return response;
}

export async function refreshSchedule(): Promise<ScheduleResponse> {
    const redis = getRedis();
    await redis.del(SCHEDULE_CACHE_KEY);
    return getSchedule();
}
