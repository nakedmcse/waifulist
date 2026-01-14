export interface AiringInfo {
    malId: number;
    anilistId: number;
    title: string;
    titleEnglish: string | null;
    coverImage: string;
    duration: number | null;
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
}

export interface AiringScheduleResponse {
    airing: AiringInfo[];
    airedToday: AiringInfo[];
    fetchedAt: string;
}

export type AiringBucket =
    | "airing_now"
    | "recently_aired"
    | "aired_today"
    | "next_hour"
    | "today"
    | "tomorrow"
    | "this_week"
    | "later";

export const AIRING_BUCKET_LABELS: Record<AiringBucket, string> = {
    airing_now: "Airing Now",
    recently_aired: "Recently Aired",
    aired_today: "Aired in the Last 24 Hours",
    next_hour: "Next Hour",
    today: "Today",
    tomorrow: "Tomorrow",
    this_week: "This Week",
    later: "Later",
};

export interface GroupedAiring {
    bucket: AiringBucket;
    items: AiringInfo[];
}
