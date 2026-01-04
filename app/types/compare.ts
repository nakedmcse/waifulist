import { Anime, WatchStatus } from "./anime";

export interface UserWatchData {
    status: WatchStatus;
    rating: number | null;
    dateAdded: string;
}

export interface CompareAnimeItem {
    anime: Anime;
    yourData?: UserWatchData;
    theirData?: UserWatchData;
}

export interface ComparisonStats {
    yourTotal: number;
    theirTotal: number;
    sharedCount: number;
    youOnlyCount: number;
    theyOnlyCount: number;
    compatibilityScore: number;
    avgRatingDiff: number | null;
}

export interface ComparisonData {
    yourUsername: string;
    theirUsername: string;
    theirPublicId: string;
    stats: ComparisonStats;
    shared: CompareAnimeItem[];
    youOnly: CompareAnimeItem[];
    theyOnly: CompareAnimeItem[];
}

export interface CompareApiResponse {
    success: boolean;
    data?: ComparisonData;
    error?: string;
}
