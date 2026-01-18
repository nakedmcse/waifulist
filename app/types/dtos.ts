import type { WatchStatus } from "@/types/anime";

export interface AiringSubscriptionDTO {
    mal_id: number;
    title: string;
    created_at: string;
}

export interface BookmarkDTO {
    bookmarked_user_id: number;
    created_at: string;
}

export interface TierListDTO {
    public_id: string;
    name: string;
    data: string;
    is_public: number;
    comments_enabled: number;
    created_at: string;
    updated_at: string;
}

export interface WatchedAnimeDTO {
    anime_id: number;
    status: WatchStatus;
    episodes_watched: number;
    rating: number | null;
    notes: string | null;
    date_added: string;
    date_updated: string;
}
