import db, { DatabaseError } from "@/lib/db/datasource";

export interface BookmarkedUser {
    id: number;
    username: string;
    public_id: string;
    created_at: string;
    bookmarked_at: string;
    watching_count: number;
    completed_count: number;
    last_activity: string | null;
}

export interface BookmarkRow {
    id: number;
    user_id: number;
    bookmarked_user_id: number;
    created_at: string;
}

export function addBookmark(userId: number, bookmarkedUserId: number): boolean {
    if (userId === bookmarkedUserId) {
        return false;
    }

    try {
        const stmt = db.prepare("INSERT INTO bookmarks (user_id, bookmarked_user_id) VALUES (?, ?)");
        const result = stmt.run(userId, bookmarkedUserId);
        return result.changes > 0;
    } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
            return false;
        }
        throw new DatabaseError("Failed to add bookmark", "addBookmark", error);
    }
}

export function removeBookmark(userId: number, bookmarkedUserId: number): boolean {
    try {
        const stmt = db.prepare("DELETE FROM bookmarks WHERE user_id = ? AND bookmarked_user_id = ?");
        const result = stmt.run(userId, bookmarkedUserId);
        return result.changes > 0;
    } catch (error) {
        throw new DatabaseError("Failed to remove bookmark", "removeBookmark", error);
    }
}

export function hasBookmark(userId: number, bookmarkedUserId: number): boolean {
    const stmt = db.prepare("SELECT 1 FROM bookmarks WHERE user_id = ? AND bookmarked_user_id = ?");
    return stmt.get(userId, bookmarkedUserId) !== undefined;
}

export function getBookmarkedUsers(userId: number): BookmarkedUser[] {
    const stmt = db.prepare(`
        SELECT
            u.id,
            u.username,
            u.public_id,
            u.created_at,
            b.created_at as bookmarked_at,
            (SELECT COUNT(*) FROM watched_anime WHERE user_id = u.id AND status = 'watching') as watching_count,
            (SELECT COUNT(*) FROM watched_anime WHERE user_id = u.id AND status = 'completed') as completed_count,
            (SELECT MAX(date_updated) FROM watched_anime WHERE user_id = u.id) as last_activity
        FROM bookmarks b
        JOIN users u ON b.bookmarked_user_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    `);
    return stmt.all(userId) as BookmarkedUser[];
}

export function getAllBookmarks(userId: number): BookmarkRow[] {
    const stmt = db.prepare(`SELECT * FROM bookmarks WHERE user_id = ?`);
    return stmt.all(userId) as BookmarkRow[];
}

export function restoreBookmarks(userId: number, rows: Partial<BookmarkRow>[]) {
    const stmt = db.prepare(`
        INSERT INTO bookmarks (user_id, bookmarked_user_id, created_at) VALUES (?, ?, ?)
        ON CONFLICT(user_id, bookmarked_user_id) DO UPDATE SET
        created_at = excluded.created_at
    `);
    const restoreMany = db.transaction((bookmarks: Partial<BookmarkRow>[]) => {
        let count = 0;
        for (const b of bookmarks) {
            const result = stmt.run(userId, b.bookmarked_user_id, b.created_at);
            if (result.changes > 0) {
                count++;
            }
        }
        return count;
    });
    try {
        return restoreMany(rows);
    } catch (error) {
        throw new DatabaseError("Failed to restore bookmarks", "restoreBookmarks", error);
    }
}
