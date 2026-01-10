import { Anime } from "./anime";

export type DayOfWeek =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "other"
    | "unknown";

export const DAYS_OF_WEEK: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "other",
    "unknown",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    other: "Other",
    unknown: "Unknown",
};

export interface Broadcast {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
}

export interface ScheduleAnime extends Anime {
    broadcast?: Broadcast;
}

export type ScheduleByDay = Record<DayOfWeek, ScheduleAnime[]>;

export interface ScheduleResponse {
    schedule: ScheduleByDay;
    lastUpdated: string;
}

export type DayFilter = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export function getCurrentDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date().getDay();
    return days[today];
}

export function mapScheduleAnimeToAnime(scheduleAnime: ScheduleAnime): Anime {
    return {
        mal_id: scheduleAnime.mal_id,
        title: scheduleAnime.title,
        title_english: scheduleAnime.title_english,
        title_japanese: scheduleAnime.title_japanese,
        images: scheduleAnime.images,
        score: scheduleAnime.score,
        episodes: scheduleAnime.episodes,
        type: scheduleAnime.type,
        source: scheduleAnime.source,
        status: scheduleAnime.status,
        synopsis: scheduleAnime.synopsis,
        genres: scheduleAnime.genres,
        studios: scheduleAnime.studios,
    };
}
