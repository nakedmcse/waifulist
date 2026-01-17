import crypto from "crypto";
import db, { DatabaseError } from "@/lib/db/datasource";

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
