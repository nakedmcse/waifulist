import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserByPublicId } from "@/lib/db";
import { getComparison } from "@/services/compareService";
import { CompareApiResponse } from "@/types/compare";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> },
): Promise<NextResponse<CompareApiResponse>> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { uuid } = await params;

    const targetUser = getUserByPublicId(uuid);
    if (!targetUser) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (currentUser.id === targetUser.id) {
        return NextResponse.json({ success: false, error: "Cannot compare with yourself" }, { status: 400 });
    }

    const comparison = await getComparison(currentUser.id, currentUser.username, uuid);
    if (!comparison) {
        return NextResponse.json({ success: false, error: "Failed to generate comparison" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: comparison });
}
