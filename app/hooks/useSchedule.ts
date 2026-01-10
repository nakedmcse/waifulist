"use client";

import { useEffect, useState } from "react";
import { DayOfWeek, ScheduleAnime, ScheduleByDay } from "@/types/schedule";
import { fetchSchedule } from "@/services/scheduleClientService";

export function useSchedule() {
    const [schedule, setSchedule] = useState<ScheduleByDay | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchSchedule();
                if (cancelled) {
                    return;
                }
                setSchedule(data.schedule);
                setLastUpdated(data.lastUpdated);
            } catch (err) {
                if (cancelled) {
                    return;
                }
                setError(err instanceof Error ? err.message : "Failed to load schedule");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const getAnimeForDay = (day: DayOfWeek): ScheduleAnime[] => {
        return schedule?.[day] || [];
    };

    const getTotalCount = (): number => {
        if (!schedule) {
            return 0;
        }
        let count = 0;
        for (const day in schedule) {
            count += schedule[day as DayOfWeek].length;
        }
        return count;
    };

    return {
        schedule,
        loading,
        error,
        lastUpdated,
        getAnimeForDay,
        getTotalCount,
    };
}
