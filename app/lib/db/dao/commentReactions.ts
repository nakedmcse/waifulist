import db from "@/lib/db/datasource";

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
