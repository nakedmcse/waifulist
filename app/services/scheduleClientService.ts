import { ScheduleResponse } from "@/types/schedule";

export async function fetchSchedule(): Promise<ScheduleResponse> {
    const response = await fetch("/api/schedule");

    if (!response.ok) {
        throw new Error("Failed to fetch schedule");
    }

    return response.json();
}
