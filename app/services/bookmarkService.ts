import type { BookmarkedUser } from "@/lib/db";

export async function fetchBookmarks(): Promise<BookmarkedUser[]> {
    try {
        const response = await fetch("/api/bookmarks");
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data.bookmarks || [];
    } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        return [];
    }
}

export async function addBookmark(publicId: string): Promise<boolean> {
    try {
        const response = await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to add bookmark:", error);
        return false;
    }
}

export async function removeBookmark(publicId: string): Promise<boolean> {
    try {
        const response = await fetch("/api/bookmarks", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to remove bookmark:", error);
        return false;
    }
}

export async function checkBookmark(uuid: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/bookmarks/check/${uuid}`);
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        return data.isBookmarked;
    } catch (error) {
        console.error("Failed to check bookmark:", error);
        return false;
    }
}
