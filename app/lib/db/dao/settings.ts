import type { UserSettings } from "@/types/settings";
import db, { DatabaseError } from "@/lib/db/datasource";

const DEFAULT_SETTINGS: UserSettings = {};

export function getUserSettings(userId: number): UserSettings {
    const stmt = db.prepare("SELECT settings FROM user_settings WHERE user_id = ?");
    const row = stmt.get(userId) as { settings: string } | undefined;

    if (!row) {
        return DEFAULT_SETTINGS;
    }

    try {
        return JSON.parse(row.settings) as UserSettings;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function updateUserSettings(userId: number, updates: Partial<UserSettings>): UserSettings {
    const updateTransaction = db.transaction(() => {
        const current = getUserSettings(userId);
        const merged: UserSettings = {
            ...current,
            ...updates,
            browse: updates.browse ? { ...current.browse, ...updates.browse } : current.browse,
            myList: updates.myList ? { ...current.myList, ...updates.myList } : current.myList,
            calendar: updates.calendar ? { ...current.calendar, ...updates.calendar } : current.calendar,
            display: updates.display ? { ...current.display, ...updates.display } : current.display,
        };

        const settingsJson = JSON.stringify(merged);

        const stmt = db.prepare(`
            INSERT INTO user_settings (user_id, settings, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
                settings = excluded.settings,
                updated_at = datetime('now')
        `);
        stmt.run(userId, settingsJson);

        return merged;
    });

    try {
        return updateTransaction();
    } catch (error) {
        throw new DatabaseError("Failed to update user settings", "updateUserSettings", error);
    }
}
