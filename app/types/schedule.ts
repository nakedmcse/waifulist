import { AiringInfo } from "./airing";
import { Anime, AnimePicture } from "./anime";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const DAY_LABELS: Record<DayOfWeek, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
};

export interface ScheduleAnime {
    mal_id: number;
    title: string;
    title_english?: string;
    images: AnimePicture;
}

export type ScheduleByDay = Record<DayOfWeek, ScheduleAnime[]>;

export interface ScheduleResponse {
    airing: AiringInfo[];
    lastUpdated: string;
}

export function getCurrentDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date().getDay();
    return days[today];
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
    };
}

export function getDayOfWeekFromTimestamp(timestamp: number): DayOfWeek {
    const date = new Date(timestamp * 1000);
    return DAYS_OF_WEEK[date.getDay()];
}

export function groupAiringByDay(airingList: AiringInfo[]): ScheduleByDay {
    const schedule: ScheduleByDay = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
    };
    const seen = new Set<number>();

    for (const info of airingList) {
        if (seen.has(info.malId)) {
            continue;
        }
        seen.add(info.malId);

        const day = getDayOfWeekFromTimestamp(info.airingAt);
        schedule[day].push(airingInfoToScheduleAnime(info));
    }

    return schedule;
}

export function scheduleAnimeToAnime(scheduleAnime: ScheduleAnime): Anime {
    return {
        mal_id: scheduleAnime.mal_id,
        title: scheduleAnime.title,
        title_english: scheduleAnime.title_english,
        images: scheduleAnime.images,
    };
}
