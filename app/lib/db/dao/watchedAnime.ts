import type { WatchStatus } from "@/types/anime";
import db, { DatabaseError } from "@/lib/db/datasource";

export interface WatchedAnimeRow {
    id: number;
    user_id: number;
    anime_id: number;
    status: WatchStatus;
    episodes_watched: number;
    rating: number | null;
    notes: string | null;
    date_added: string;
    date_updated: string;
}

export function addToWatchList(userId: number, animeId: number, status: string): WatchedAnimeRow {
    const addToListTransaction = db.transaction(() => {
        const stmt = db.prepare(`
            INSERT INTO watched_anime (user_id, anime_id, status)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, anime_id) DO UPDATE SET
                status = excluded.status,
                date_updated = datetime('now')
        `);
        stmt.run(userId, animeId, status);
        const row = getWatchedAnime(userId, animeId);
        if (!row) {
            throw new DatabaseError("Failed to add/update watch list entry", "addToWatchList");
        }
        return row;
    });

    try {
        return addToListTransaction();
    } catch (error) {
        if (error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError("Failed to add to watch list", "addToWatchList", error);
    }
}

export function restoreWatchList(userId: number, rows: Partial<WatchedAnimeRow>[]): number {
    const stmt = db.prepare(`
        INSERT INTO watched_anime (user_id, anime_id, status, episodes_watched, rating, notes, date_added, date_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, anime_id) DO UPDATE SET
        status = excluded.status,
        episodes_watched = excluded.episodes_watched,
        rating = excluded.rating,
        notes = excluded.notes,
        date_added = excluded.date_added,
        date_updated = excluded.date_updated
    `);

    const restoreMany = db.transaction((watched: Partial<WatchedAnimeRow>[]) => {
        let count = 0;
        for (const w of watched) {
            const result = stmt.run(
                userId,
                w.anime_id,
                w.status,
                w.episodes_watched,
                w.rating,
                w.notes ?? null,
                w.date_added,
                w.date_updated,
            );
            if (result.changes > 0) {
                count++;
            }
        }
        return count;
    });

    try {
        return restoreMany(rows);
    } catch (error) {
        throw new DatabaseError(`Failed to restore ${rows.length} anime to watch list`, "restoreWatchList", error);
    }
}

export function bulkAddToWatchList(userId: number, animeIds: number[], status: string): number {
    const stmt = db.prepare(`
        INSERT INTO watched_anime (user_id, anime_id, status)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, anime_id) DO NOTHING
    `);

    const insertMany = db.transaction((ids: number[]) => {
        let count = 0;
        for (const animeId of ids) {
            const result = stmt.run(userId, animeId, status);
            if (result.changes > 0) {
                count++;
            }
        }
        return count;
    });

    try {
        return insertMany(animeIds);
    } catch (error) {
        throw new DatabaseError(
            `Failed to bulk add ${animeIds.length} anime to watch list`,
            "bulkAddToWatchList",
            error,
        );
    }
}

export type BulkImportEntry = {
    animeId: number;
    status: WatchStatus;
    episodesWatched: number;
    rating: number | null;
    notes: string | null;
};

export function bulkImportToWatchList(userId: number, entries: BulkImportEntry[]): number {
    const stmt = db.prepare(`
        INSERT INTO watched_anime (user_id, anime_id, status, episodes_watched, rating, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, anime_id) DO UPDATE SET
            status = excluded.status,
            episodes_watched = excluded.episodes_watched,
            rating = excluded.rating,
            notes = excluded.notes,
            date_updated = datetime('now')
    `);

    const importMany = db.transaction((items: BulkImportEntry[]) => {
        let count = 0;
        for (const entry of items) {
            const result = stmt.run(
                userId,
                entry.animeId,
                entry.status,
                entry.episodesWatched,
                entry.rating,
                entry.notes,
            );
            if (result.changes > 0) {
                count++;
            }
        }
        return count;
    });

    try {
        return importMany(entries);
    } catch (error) {
        throw new DatabaseError(
            `Failed to bulk import ${entries.length} anime to watch list`,
            "bulkImportToWatchList",
            error,
        );
    }
}

export function updateWatchStatus(
    userId: number,
    animeId: number,
    updates: { status?: string; episodes_watched?: number; rating?: number | null; notes?: string | null },
): WatchedAnimeRow {
    const updateTransaction = db.transaction(() => {
        const fields: string[] = ["date_updated = datetime('now')"];
        const values: (string | number | null)[] = [];

        if (updates.status !== undefined) {
            fields.push("status = ?");
            values.push(updates.status);
        }
        if (updates.episodes_watched !== undefined) {
            fields.push("episodes_watched = ?");
            values.push(updates.episodes_watched);
        }
        if (updates.rating !== undefined) {
            fields.push("rating = ?");
            values.push(updates.rating);
        }
        if (updates.notes !== undefined) {
            fields.push("notes = ?");
            values.push(updates.notes);
        }

        values.push(userId, animeId);

        const stmt = db.prepare(`UPDATE watched_anime SET ${fields.join(", ")} WHERE user_id = ? AND anime_id = ?`);
        const result = stmt.run(...values);

        if (result.changes === 0) {
            throw new DatabaseError(
                `No watch list entry found for user ${userId} and anime ${animeId}`,
                "updateWatchStatus",
            );
        }

        const row = getWatchedAnime(userId, animeId);
        if (!row) {
            throw new DatabaseError("Updated entry could not be retrieved", "updateWatchStatus");
        }
        return row;
    });

    try {
        return updateTransaction();
    } catch (error) {
        if (error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError("Failed to update watch status", "updateWatchStatus", error);
    }
}

export function removeFromWatchList(userId: number, animeId: number): boolean {
    try {
        const stmt = db.prepare("DELETE FROM watched_anime WHERE user_id = ? AND anime_id = ?");
        const result = stmt.run(userId, animeId);
        return result.changes > 0;
    } catch (error) {
        throw new DatabaseError("Failed to remove from watch list", "removeFromWatchList", error);
    }
}

export function getWatchedAnime(userId: number, animeId: number): WatchedAnimeRow | null {
    const stmt = db.prepare("SELECT * FROM watched_anime WHERE user_id = ? AND anime_id = ?");
    return stmt.get(userId, animeId) as WatchedAnimeRow | null;
}

export function getAllWatched(userId: number): WatchedAnimeRow[] {
    const stmt = db.prepare("SELECT * FROM watched_anime WHERE user_id = ? ORDER BY date_updated DESC");
    return stmt.all(userId) as WatchedAnimeRow[];
}

export function getWatchedByStatus(userId: number, status: WatchStatus): WatchedAnimeRow[] {
    const stmt = db.prepare("SELECT * FROM watched_anime WHERE user_id = ? AND status = ? ORDER BY date_updated DESC");
    return stmt.all(userId, status) as WatchedAnimeRow[];
}

export function getWatchedCount(userId: number): number {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM watched_anime WHERE user_id = ?");
    const result = stmt.get(userId) as { count: number };
    return result.count;
}

export function getWatchedCountByStatus(userId: number): Record<string, number> {
    const stmt = db.prepare("SELECT status, COUNT(*) as count FROM watched_anime WHERE user_id = ? GROUP BY status");
    const rows = stmt.all(userId) as { status: string; count: number }[];
    const counts: Record<string, number> = {};

    for (const row of rows) {
        counts[row.status] = row.count;
    }

    return counts;
}

export function getTopRatedAnime(userId: number, limit: number = 5): WatchedAnimeRow[] {
    const stmt = db.prepare(
        "SELECT * FROM watched_anime WHERE user_id = ? AND rating IS NOT NULL ORDER BY rating DESC, date_added DESC LIMIT ?",
    );
    return stmt.all(userId, limit) as WatchedAnimeRow[];
}

export function getRecentAnime(userId: number, limit: number = 5, excludeIds: number[] = []): WatchedAnimeRow[] {
    if (excludeIds.length === 0) {
        const stmt = db.prepare("SELECT * FROM watched_anime WHERE user_id = ? ORDER BY date_added DESC LIMIT ?");
        return stmt.all(userId, limit) as WatchedAnimeRow[];
    }
    const placeholders = excludeIds.map(() => "?").join(",");
    const stmt = db.prepare(
        `SELECT * FROM watched_anime WHERE user_id = ? AND anime_id NOT IN (${placeholders}) ORDER BY date_added DESC LIMIT ?`,
    );
    return stmt.all(userId, ...excludeIds, limit) as WatchedAnimeRow[];
}

export function getWatchedAnimeForUsers(userIds: number[], animeId: number): WatchedAnimeRow[] {
    if (userIds.length === 0) {
        return [];
    }
    const placeholders = userIds.map(() => "?").join(",");
    const stmt = db.prepare(`SELECT * FROM watched_anime WHERE user_id IN (${placeholders}) AND anime_id = ?`);
    return stmt.all(...userIds, animeId) as WatchedAnimeRow[];
}
