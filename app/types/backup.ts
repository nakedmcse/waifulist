import { BookmarkDTO } from "@/lib/db/dao/bookmarks";
import { TierListDTO } from "@/lib/db/dao/tierList";
import { WatchedAnimeDTO } from "@/lib/db/dao/watchedAnime";
import { AiringSubscriptionDTO } from "@/lib/db/dao/airingSubscription";

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
