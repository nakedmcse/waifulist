import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllBookmarks } from "@/lib/db/dao/bookmarks";
import { getUserById } from "@/lib/db/dao/user";
import { getWatchedAnimeForUsers } from "@/lib/db/dao/watchedAnime";
import type { FriendRating } from "@/types/anime";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { id } = await params;
    const animeId = parseInt(id, 10);

    if (isNaN(animeId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const bookmarks = getAllBookmarks(user.id);
    if (bookmarks.length === 0) {
        return NextResponse.json({ friendsRatings: [] });
    }

    const bookmarkedUserIds = bookmarks.map(b => b.bookmarked_user_id);
    const watchedEntries = getWatchedAnimeForUsers(bookmarkedUserIds, animeId);

    const userIdToBookmark = new Map<number, (typeof bookmarks)[0]>();
    for (const bookmark of bookmarks) {
        userIdToBookmark.set(bookmark.bookmarked_user_id, bookmark);
    }

    const friendsRatings: FriendRating[] = [];
    for (const entry of watchedEntries) {
        const bookmarkedUser = getUserById(entry.user_id);
        if (!bookmarkedUser) {
            continue;
        }

        friendsRatings.push({
            username: bookmarkedUser.username,
            publicId: bookmarkedUser.public_id,
            rating: entry.rating,
            notes: entry.notes,
            status: entry.status,
            episodesWatched: entry.episodes_watched,
        });
    }

    return NextResponse.json({ friendsRatings });
}
