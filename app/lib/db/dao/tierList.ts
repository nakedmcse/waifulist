import crypto from "crypto";
import db, { DatabaseError } from "@/lib/db/datasource";

export interface TierListRow {
    id: number;
    user_id: number;
    public_id: string;
    name: string;
    data: string;
    is_public: number;
    comments_enabled: number;
    created_at: string;
    updated_at: string;
}

export interface TierListWithUsername extends TierListRow {
    username: string;
}

export function createTierList(userId: number, name: string = "My Tier List"): TierListRow {
    const publicId = crypto.randomUUID();
    const stmt = db.prepare(`
        INSERT INTO tier_lists (user_id, public_id, name)
        VALUES (?, ?, ?)
    `);
    const result = stmt.run(userId, publicId, name);
    const tierList = getTierListById(result.lastInsertRowid as number);
    if (!tierList) {
        throw new DatabaseError("Tier list created but could not be retrieved", "createTierList");
    }
    return tierList;
}

export function getTierListById(id: number): TierListRow | null {
    const stmt = db.prepare("SELECT * FROM tier_lists WHERE id = ?");
    return stmt.get(id) as TierListRow | null;
}

export function getTierListByPublicId(publicId: string): TierListWithUsername | null {
    const stmt = db.prepare(`
        SELECT t.*, u.username
        FROM tier_lists t
        JOIN users u ON t.user_id = u.id
        WHERE t.public_id = ?
    `);
    return stmt.get(publicId) as TierListWithUsername | null;
}

export function getTierListsByUserId(userId: number): TierListRow[] {
    const stmt = db.prepare("SELECT * FROM tier_lists WHERE user_id = ? ORDER BY updated_at DESC");
    return stmt.all(userId) as TierListRow[];
}

export function updateTierList(
    id: number,
    userId: number,
    updates: { name?: string; data?: string; is_public?: number; comments_enabled?: number },
): TierListRow {
    const fields: string[] = ["updated_at = datetime('now')"];
    const values: (string | number)[] = [];

    if (updates.name !== undefined) {
        fields.push("name = ?");
        values.push(updates.name);
    }
    if (updates.data !== undefined) {
        fields.push("data = ?");
        values.push(updates.data);
    }
    if (updates.is_public !== undefined) {
        fields.push("is_public = ?");
        values.push(updates.is_public);
    }
    if (updates.comments_enabled !== undefined) {
        fields.push("comments_enabled = ?");
        values.push(updates.comments_enabled);
    }

    values.push(id, userId);

    const stmt = db.prepare(`UPDATE tier_lists SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`);
    const result = stmt.run(...values);

    if (result.changes === 0) {
        throw new DatabaseError("Tier list not found or not owned by user", "updateTierList");
    }

    const tierList = getTierListById(id);
    if (!tierList) {
        throw new DatabaseError("Tier list updated but could not be retrieved", "updateTierList");
    }
    return tierList;
}

export function deleteTierList(id: number, userId: number): boolean {
    const stmt = db.prepare("DELETE FROM tier_lists WHERE id = ? AND user_id = ?");
    const result = stmt.run(id, userId);
    return result.changes > 0;
}

export function restoreTierLists(userId: number, rows: Partial<TierListRow>[]) {
    const stmt = db.prepare(`
        INSERT INTO tier_lists (user_id, public_id, name, data, comments_enabled, created_at, updated_at, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(public_id) DO UPDATE SET
        name = excluded.name,
        data = excluded.data,
        comments_enabled = excluded.comments_enabled,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        is_public = excluded.is_public
        WHERE tier_lists.user_id = excluded.user_id
    `);
    const restoreMany = db.transaction((tiers: Partial<TierListRow>[]) => {
        let count = 0;
        for (const t of tiers) {
            const result = stmt.run(
                userId,
                t.public_id,
                t.name,
                t.data,
                t.comments_enabled,
                t.created_at,
                t.updated_at,
                t.is_public,
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
        throw new DatabaseError("Failed to restore tier lists", "restoreTierLists", error);
    }
}

export type PublicTierListSort = "newest" | "oldest" | "name";

export interface PublicTierListsResult {
    rows: TierListWithUsername[];
    total: number;
}

export function getPublicTierLists(options: {
    limit: number;
    offset: number;
    search?: string;
    sort?: PublicTierListSort;
}): PublicTierListsResult {
    const { limit, offset, search, sort = "newest" } = options;

    let orderBy = "t.updated_at DESC";
    if (sort === "oldest") {
        orderBy = "t.updated_at ASC";
    } else if (sort === "name") {
        orderBy = "t.name ASC";
    }

    const baseQuery = `
        FROM tier_lists t
        JOIN users u ON t.user_id = u.id
        WHERE t.is_public = 1
        ${search ? "AND (t.name LIKE '%' || ? || '%' OR u.username LIKE '%' || ? || '%')" : ""}
    `;

    const countStmt = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`);
    const countParams = search ? [search, search] : [];
    const countResult = countStmt.get(...countParams) as { count: number };

    const dataStmt = db.prepare(`
        SELECT t.*, u.username
        ${baseQuery}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
    `);
    const dataParams = search ? [search, search, limit, offset] : [limit, offset];
    const rows = dataStmt.all(...dataParams) as TierListWithUsername[];

    return { rows, total: countResult.count };
}
