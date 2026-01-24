import { NextResponse } from "next/server";
import { getSchedule } from "@/services/backend/scheduleService";

export async function GET() {
    try {
        const schedule = await getSchedule();
        return NextResponse.json(schedule);
    } catch (error) {
        console.error("[API/schedule] Error:", error);
        return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }
}
