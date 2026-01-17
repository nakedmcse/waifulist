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

export interface TierListDTO {
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

export function restoreTierLists(userId: number, rows: TierListDTO[]) {
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
    const restoreMany = db.transaction((tiers: TierListDTO[]) => {
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

export interface AnonymousTierListRow {
    id: number;
    public_id: string;
    name: string;
    data: string;
    created_at: string;
}

export function createAnonymousTierList(name: string, data: string): AnonymousTierListRow {
    const publicId = crypto.randomUUID();
    const stmt = db.prepare(`
        INSERT INTO anonymous_tier_lists (public_id, name, data)
        VALUES (?, ?, ?)
    `);
    const result = stmt.run(publicId, name, data);
    const tierList = getAnonymousTierListById(result.lastInsertRowid as number);
    if (!tierList) {
        throw new DatabaseError("Anonymous tier list created but could not be retrieved", "createAnonymousTierList");
    }
    return tierList;
}

export function getAnonymousTierListById(id: number): AnonymousTierListRow | null {
    const stmt = db.prepare("SELECT * FROM anonymous_tier_lists WHERE id = ?");
    return stmt.get(id) as AnonymousTierListRow | null;
}

export function getAnonymousTierListByPublicId(publicId: string): AnonymousTierListRow | null {
    const stmt = db.prepare("SELECT * FROM anonymous_tier_lists WHERE public_id = ?");
    return stmt.get(publicId) as AnonymousTierListRow | null;
}

export interface TierListCommentRow {
    id: number;
    tier_list_id: number;
    user_id: number;
    username: string;
    content: string;
    created_at: string;
}

export function getCommentsByTierListId(tierListId: number): TierListCommentRow[] {
    const stmt = db.prepare(`
        SELECT c.*, u.username
        FROM tier_list_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.tier_list_id = ?
        ORDER BY c.created_at DESC
    `);
    return stmt.all(tierListId) as TierListCommentRow[];
}

export function createComment(tierListId: number, userId: number, content: string): TierListCommentRow {
    const stmt = db.prepare(`
        INSERT INTO tier_list_comments (tier_list_id, user_id, content)
        VALUES (?, ?, ?)
    `);
    const result = stmt.run(tierListId, userId, content);

    const commentStmt = db.prepare(`
        SELECT c.*, u.username
        FROM tier_list_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    `);
    const comment = commentStmt.get(result.lastInsertRowid) as TierListCommentRow | null;
    if (!comment) {
        throw new DatabaseError("Comment created but could not be retrieved", "createComment");
    }
    return comment;
}

export function deleteComment(commentId: number, userId: number, tierListOwnerId: number): boolean {
    const stmt = db.prepare(`
        DELETE FROM tier_list_comments
        WHERE id = ? AND (user_id = ? OR ? = (SELECT user_id FROM tier_lists WHERE id = tier_list_id))
    `);
    const result = stmt.run(commentId, userId, tierListOwnerId);
    return result.changes > 0;
}

export function getCommentById(commentId: number): TierListCommentRow | null {
    const stmt = db.prepare(`
        SELECT c.*, u.username
        FROM tier_list_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    `);
    return stmt.get(commentId) as TierListCommentRow | null;
}

export interface CommentReactionRow {
    id: number;
    comment_id: number;
    user_id: number;
    emoji: string;
    created_at: string;
}

export interface ReactionCount {
    emoji: string;
    count: number;
    userReacted: boolean;
    users: string[];
}

export function getReactionsForComments(commentIds: number[], userId: number | null): Map<number, ReactionCount[]> {
    if (commentIds.length === 0) {
        return new Map();
    }

    const placeholders = commentIds.map(() => "?").join(",");
    const stmt = db.prepare(`
        SELECT comment_id, emoji, COUNT(*) as count
        FROM comment_reactions
        WHERE comment_id IN (${placeholders})
        GROUP BY comment_id, emoji
    `);
    const counts = stmt.all(...commentIds) as { comment_id: number; emoji: string; count: number }[];

    const usersStmt = db.prepare(`
        SELECT cr.comment_id, cr.emoji, u.username
        FROM comment_reactions cr
        JOIN users u ON cr.user_id = u.id
        WHERE cr.comment_id IN (${placeholders})
        ORDER BY cr.created_at ASC
    `);
    const userRows = usersStmt.all(...commentIds) as { comment_id: number; emoji: string; username: string }[];

    const usersMap = new Map<string, string[]>();
    for (const row of userRows) {
        const key = `${row.comment_id}:${row.emoji}`;
        const users = usersMap.get(key) || [];
        if (users.length < 10) {
            users.push(row.username);
        }
        usersMap.set(key, users);
    }

    let userReactions: Set<string> = new Set();
    if (userId) {
        const userStmt = db.prepare(`
            SELECT comment_id, emoji
            FROM comment_reactions
            WHERE comment_id IN (${placeholders}) AND user_id = ?
        `);
        const myRows = userStmt.all(...commentIds, userId) as { comment_id: number; emoji: string }[];
        userReactions = new Set(myRows.map(r => `${r.comment_id}:${r.emoji}`));
    }

    const result = new Map<number, ReactionCount[]>();
    for (const commentId of commentIds) {
        result.set(commentId, []);
    }

    for (const row of counts) {
        const key = `${row.comment_id}:${row.emoji}`;
        const reactions = result.get(row.comment_id) || [];
        reactions.push({
            emoji: row.emoji,
            count: row.count,
            userReacted: userReactions.has(key),
            users: usersMap.get(key) || [],
        });
        result.set(row.comment_id, reactions);
    }

    return result;
}

export function toggleReaction(commentId: number, userId: number, emoji: string): boolean {
    const existing = db
        .prepare(
            `
        SELECT id FROM comment_reactions WHERE comment_id = ? AND user_id = ? AND emoji = ?
    `,
        )
        .get(commentId, userId, emoji);

    if (existing) {
        db.prepare(`DELETE FROM comment_reactions WHERE comment_id = ? AND user_id = ? AND emoji = ?`).run(
            commentId,
            userId,
            emoji,
        );
        return false;
    } else {
        db.prepare(`INSERT INTO comment_reactions (comment_id, user_id, emoji) VALUES (?, ?, ?)`).run(
            commentId,
            userId,
            emoji,
        );
        return true;
    }
}
