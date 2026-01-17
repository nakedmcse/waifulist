import bcrypt from "bcrypt";
import crypto from "crypto";
import db, { DatabaseError } from "@/lib/db/datasource";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export interface User {
    id: number;
    username: string;
    password_hash: string;
    public_id: string;
    created_at: string;
}

export async function createUser(username: string, password: string): Promise<User> {
    const passwordHash = await hashPassword(password);
    const publicId = crypto.randomUUID();

    const createUserTransaction = db.transaction(() => {
        const stmt = db.prepare("INSERT INTO users (username, password_hash, public_id) VALUES (?, ?, ?)");
        const result = stmt.run(username, passwordHash, publicId);
        const user = getUserById(result.lastInsertRowid as number);
        if (!user) {
            throw new DatabaseError("User created but could not be retrieved", "createUser");
        }
        return user;
    });

    try {
        return createUserTransaction();
    } catch (error) {
        if (error instanceof DatabaseError) {
            throw error;
        }
        if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
            throw new DatabaseError(`Username '${username}' already exists`, "createUser", error);
        }
        throw new DatabaseError("Failed to create user", "createUser", error);
    }
}

export function getUserById(id: number): User | null {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return stmt.get(id) as User | null;
}

export function getUserByUsername(username: string): User | null {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username) as User | null;
}

export function getUserByPublicId(publicId: string): User | null {
    const stmt = db.prepare("SELECT * FROM users WHERE public_id = ?");
    return stmt.get(publicId) as User | null;
}

export function updateUsername(userId: number, newUsername: string): User {
    const updateTransaction = db.transaction(() => {
        const stmt = db.prepare("UPDATE users SET username = ? WHERE id = ?");
        const result = stmt.run(newUsername, userId);

        if (result.changes === 0) {
            throw new DatabaseError(`User with id ${userId} not found`, "updateUsername");
        }

        const user = getUserById(userId);
        if (!user) {
            throw new DatabaseError("User updated but could not be retrieved", "updateUsername");
        }
        return user;
    });

    try {
        return updateTransaction();
    } catch (error) {
        if (error instanceof DatabaseError) {
            throw error;
        }
        if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
            throw new DatabaseError(`Username '${newUsername}' is already taken`, "updateUsername", error);
        }
        throw new DatabaseError("Failed to update username", "updateUsername", error);
    }
}

export async function updatePassword(userId: number, newPassword: string): Promise<User> {
    const passwordHash = await hashPassword(newPassword);

    const stmt = db.prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    const result = stmt.run(passwordHash, userId);

    if (result.changes === 0) {
        throw new DatabaseError(`User with id ${userId} not found`, "updatePassword");
    }

    const user = getUserById(userId);
    if (!user) {
        throw new DatabaseError("User updated but could not be retrieved", "updatePassword");
    }
    return user;
}
