import { NextResponse } from "next/server";
import { getQuotaInfo } from "@/services/backend/traceMoe";

export async function GET(): Promise<NextResponse> {
    try {
        const quota = await getQuotaInfo();
        return NextResponse.json(quota);
    } catch (error) {
        console.error("[Trace Quota API] Error:", error);
        return NextResponse.json({ error: "Failed to fetch quota info" }, { status: 500 });
    }
}
