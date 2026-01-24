import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFilteredWatchList } from "@/services/backend/watchListService";

export async function GET(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const result = await getFilteredWatchList(user.id, new URL(request.url));
    return NextResponse.json(result);
}
