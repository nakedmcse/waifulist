import { NextRequest, NextResponse } from "next/server";
import { getUserByPublicId } from "@/lib/db";
import { getFilteredWatchList } from "@/services/watchListService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    const user = getUserByPublicId(uuid);
    if (!user) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const result = await getFilteredWatchList(user.id, new URL(request.url));
    return NextResponse.json({ ...result, username: user.username });
}
