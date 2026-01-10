"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import { DAY_LABELS, DayOfWeek, DAYS_OF_WEEK, getCurrentDayOfWeek, mapScheduleAnimeToAnime } from "@/types/schedule";
import { AnimeCard } from "@/components/AnimeCard/AnimeCard";
import { useWatchList } from "@/contexts/WatchListContext";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.scss";

export function SchedulePageClient() {
    const { loading, error, getAnimeForDay, lastUpdated } = useSchedule();
    const { ensureLoaded } = useWatchList();
    const [activeDay, setActiveDay] = useState<DayOfWeek>(getCurrentDayOfWeek());

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    const handleDayChange = useCallback((day: DayOfWeek) => {
        setActiveDay(day);
    }, []);

    const animeForDay = getAnimeForDay(activeDay);
    const displayDays = DAYS_OF_WEEK.filter(day => day !== "other" && day !== "unknown");
    const todayDay = getCurrentDayOfWeek();

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <Spinner text="Loading schedule..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>
                    <i className="bi bi-exclamation-triangle" />
                    <h3>Failed to load schedule</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Anime Schedule</h1>
                <p className={styles.subtitle}>Currently airing anime by day of the week</p>
                {lastUpdated && (
                    <p className={styles.lastUpdated}>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
                )}
            </div>

            <div className={styles.tabBar}>
                {displayDays.map(day => {
                    const count = getAnimeForDay(day).length;
                    const isToday = day === todayDay;
                    const isActive = day === activeDay;
                    return (
                        <button
                            key={day}
                            className={`${styles.tab} ${isActive ? styles.active : ""} ${isToday ? styles.today : ""}`}
                            onClick={() => handleDayChange(day)}
                        >
                            <span className={styles.dayName}>{DAY_LABELS[day]}</span>
                            <span className={styles.count}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <div className={styles.resultInfo}>
                <span>
                    {animeForDay.length} anime airing on {DAY_LABELS[activeDay]}
                    {activeDay === todayDay && " (Today)"}
                </span>
            </div>

            {animeForDay.length > 0 ? (
                <div className={styles.grid}>
                    {animeForDay.map(anime => (
                        <AnimeCard key={anime.mal_id} anime={mapScheduleAnimeToAnime(anime)} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <i className="bi bi-calendar-x" />
                    <h3>No anime scheduled</h3>
                    <p>There are no anime scheduled for {DAY_LABELS[activeDay]}</p>
                </div>
            )}
        </div>
    );
}
