import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addBookmark, getBookmarkedUsers, removeBookmark } from "@/lib/db/dao/bookmarks";
import { getUserByPublicId } from "@/lib/db/dao/user";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const bookmarks = getBookmarkedUsers(user.id);
    return NextResponse.json({ success: true, bookmarks });
}

export async function POST(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { publicId } = body;

        if (!publicId) {
            return NextResponse.json({ error: "publicId required" }, { status: 400 });
        }

        const targetUser = getUserByPublicId(publicId);
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (targetUser.id === user.id) {
            return NextResponse.json({ error: "Cannot bookmark yourself" }, { status: 400 });
        }

        const added = addBookmark(user.id, targetUser.id);
        if (!added) {
            return NextResponse.json({ error: "Already bookmarked" }, { status: 409 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Add bookmark error:", error);
        return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { publicId } = body;

        if (!publicId) {
            return NextResponse.json({ error: "publicId required" }, { status: 400 });
        }

        const targetUser = getUserByPublicId(publicId);
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const removed = removeBookmark(user.id, targetUser.id);
        if (!removed) {
            return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove bookmark error:", error);
        return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 });
    }
}
