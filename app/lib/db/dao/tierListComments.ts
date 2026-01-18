import db, { DatabaseError } from "@/lib/db/datasource";

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
