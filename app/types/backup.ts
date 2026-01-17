import { BookmarkDTO, WatchedAnimeDTO, TierListDTO, AiringSubscriptionDTO } from "@/types/dtos";

export interface BackupData {
    Anime: WatchedAnimeDTO[];
    Bookmarks: BookmarkDTO[];
    TierLists: TierListDTO[];
    AiringSubscriptions: AiringSubscriptionDTO[];
}

export interface BackupChoices {
    Anime: boolean;
    Bookmarks: boolean;
    TierLists: boolean;
    AiringSubscriptions: boolean;
}
