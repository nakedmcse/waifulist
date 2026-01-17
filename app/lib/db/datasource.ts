import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { isBuildPhase } from "@/lib/utils/runtimeUtils";
import { updateSchema } from "@/lib/db/schema";

export class DatabaseError extends Error {
    public constructor(
        message: string,
        public readonly operation: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = "DatabaseError";
    }
}

const dataDir = path.join(process.cwd(), "data");
if (!isBuildPhase && !fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "waifulist.db");
const db = isBuildPhase ? ({} as Database.Database) : new Database(dbPath);

if (!isBuildPhase) {
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    updateSchema(db);

    const backfillPublicIds = db.transaction(() => {
        const usersWithoutPublicId = db.prepare("SELECT id FROM users WHERE public_id IS NULL").all() as {
            id: number;
        }[];
        if (usersWithoutPublicId.length > 0) {
            const updateStmt = db.prepare("UPDATE users SET public_id = ? WHERE id = ?");
            for (const user of usersWithoutPublicId) {
                updateStmt.run(crypto.randomUUID(), user.id);
            }
        }
    });
    backfillPublicIds();

    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id)");
}

export default db;
