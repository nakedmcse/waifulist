import type { BrowseSettings, CalendarSettings, DisplaySettings, MyListSettings, UserSettings } from "@/types/settings";

export async function fetchUserSettings(): Promise<UserSettings | null> {
    try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        return data.settings || null;
    } catch {
        return null;
    }
}

export async function updateBrowseSettingsApi(updates: Partial<BrowseSettings>): Promise<void> {
    await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ browse: updates }),
    });
}

export async function updateMyListSettingsApi(updates: Partial<MyListSettings>): Promise<void> {
    await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myList: updates }),
    });
}

export async function updateCalendarSettingsApi(updates: Partial<CalendarSettings>): Promise<void> {
    await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendar: updates }),
    });
}

export async function updateDisplaySettingsApi(updates: Partial<DisplaySettings>): Promise<void> {
    await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display: updates }),
    });
}

export async function updateM3Api(value: boolean): Promise<void> {
    await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _m3: value }),
    });
}
