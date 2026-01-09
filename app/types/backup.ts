import { BookmarkRow, TierListRow, WatchedAnimeRow } from "@/lib/db";

export interface BackupData {
    Anime: WatchedAnimeRow[];
    Bookmarks: BookmarkRow[];
    TierLists: TierListRow[];
}
