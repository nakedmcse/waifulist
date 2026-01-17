import db, { DatabaseError } from "@/lib/db/datasource";

export interface AiringSubscriptionRow {
    id: number;
    user_id: number;
    mal_id: number;
    title: string;
    created_at: string;
}

export function restoreAiringSubscriptions(userId: number, rows: Partial<AiringSubscriptionRow>[]) {
    const stmt = db.prepare(`
        INSERT INTO airing_subscriptions (user_id, mal_id, title, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, mal_id) DO UPDATE SET
        title = excluded.title,
        created_at = excluded.created_at  
    `);
    const restoreMany = db.transaction((airings: Partial<AiringSubscriptionRow>[]) => {
        let count = 0;
        for (const a of airings) {
            const result = stmt.run(userId, a.mal_id, a.title, a.created_at);
            if (result.changes > 0) {
                count++;
            }
        }
        return count;
    });
    try {
        return restoreMany(rows);
    } catch (error) {
        throw new DatabaseError("Failed to restore airing subscriptions", "restoreAiringSubscriptions", error);
    }
}

export function addAiringSubscription(userId: number, malId: number, title: string): boolean {
    try {
        db.prepare(`INSERT INTO airing_subscriptions (user_id, mal_id, title) VALUES (?, ?, ?)`).run(
            userId,
            malId,
            title,
        );
        return true;
    } catch {
        return false;
    }
}

export function removeAiringSubscription(userId: number, malId: number): boolean {
    const result = db.prepare(`DELETE FROM airing_subscriptions WHERE user_id = ? AND mal_id = ?`).run(userId, malId);
    return result.changes > 0;
}

export function getAiringSubscriptions(userId: number): AiringSubscriptionRow[] {
    return db
        .prepare(`SELECT * FROM airing_subscriptions WHERE user_id = ? ORDER BY created_at DESC`)
        .all(userId) as AiringSubscriptionRow[];
}

export function hasAiringSubscription(userId: number, malId: number): boolean {
    const row = db.prepare(`SELECT 1 FROM airing_subscriptions WHERE user_id = ? AND mal_id = ?`).get(userId, malId);
    return !!row;
}

export function getUniqueSubscribedMalIds(): number[] {
    const rows = db.prepare(`SELECT DISTINCT mal_id FROM airing_subscriptions`).all() as { mal_id: number }[];
    return rows.map(r => r.mal_id);
}

export function deleteSubscriptionsByMalIds(malIds: number[]): number {
    if (malIds.length === 0) {
        return 0;
    }
    const placeholders = malIds.map(() => "?").join(",");
    const result = db.prepare(`DELETE FROM airing_subscriptions WHERE mal_id IN (${placeholders})`).run(...malIds);
    return result.changes;
}
