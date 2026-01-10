"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentSeason, parseSeasonParam, parseYearParam, SeasonYear } from "@/lib/seasonUtils";
import { useSeasonalAnime } from "@/hooks/useSeasonalAnime";
import { useSchedule } from "@/hooks/useSchedule";
import { useGenreFilter } from "@/hooks";
import { useWatchList } from "@/contexts/WatchListContext";
import { SeasonSelector } from "@/components/SeasonSelector/SeasonSelector";
import { GenreFilter } from "@/components/GenreFilter/GenreFilter";
import { AnimeCard } from "@/components/AnimeCard/AnimeCard";
import { Pagination } from "@/components/Pagination/Pagination";
import { Spinner } from "@/components/Spinner/Spinner";
import { DAY_LABELS, DayOfWeek, DAYS_OF_WEEK, getCurrentDayOfWeek, mapScheduleAnimeToAnime } from "@/types/schedule";
import { PAGE_SIZE } from "@/constants/pagination";
import styles from "./page.module.scss";

type CalendarView = "seasonal" | "schedule";

export function CalendarPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ensureLoaded } = useWatchList();

    const viewParam = searchParams.get("view");
    const [view, setView] = useState<CalendarView>(viewParam === "schedule" ? "schedule" : "seasonal");

    const seasonParam = parseSeasonParam(searchParams.get("season"));
    const yearParam = parseYearParam(searchParams.get("year"));
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const defaultSeason = getCurrentSeason();
    const [seasonYear, setSeasonYear] = useState<SeasonYear>({
        season: seasonParam || defaultSeason.season,
        year: yearParam || defaultSeason.year,
    });
    const [page, setPage] = useState(pageParam);
    const [activeDay, setActiveDay] = useState<DayOfWeek>(getCurrentDayOfWeek());

    const { allGenres, selectedGenres, genresLoading, handleGenreChange: baseHandleGenreChange } = useGenreFilter();

    const {
        anime: seasonalAnime,
        totalCount,
        filteredCount,
        loading: seasonalLoading,
    } = useSeasonalAnime({
        year: seasonYear.year,
        season: seasonYear.season,
        page,
        pageSize: PAGE_SIZE,
        genres: selectedGenres,
    });

    const { loading: scheduleLoading, error: scheduleError, getAnimeForDay, lastUpdated } = useSchedule();

    const totalPages = Math.ceil(filteredCount / PAGE_SIZE);
    const animeForDay = getAnimeForDay(activeDay);
    const displayDays = DAYS_OF_WEEK.filter(day => day !== "other" && day !== "unknown");
    const todayDay = getCurrentDayOfWeek();

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    const updateUrl = useCallback(
        (newView: CalendarView, newSeasonYear?: SeasonYear, newPage?: number) => {
            const url = new URL(window.location.href);
            url.searchParams.set("view", newView);
            if (newView === "seasonal") {
                const sy = newSeasonYear || seasonYear;
                const p = newPage ?? page;
                url.searchParams.set("year", sy.year.toString());
                url.searchParams.set("season", sy.season);
                if (p > 1) {
                    url.searchParams.set("page", p.toString());
                } else {
                    url.searchParams.delete("page");
                }
            } else {
                url.searchParams.delete("year");
                url.searchParams.delete("season");
                url.searchParams.delete("page");
            }
            router.replace(url.pathname + url.search, { scroll: false });
        },
        [router, seasonYear, page],
    );

    const handleViewChange = useCallback(
        (newView: CalendarView) => {
            setView(newView);
            updateUrl(newView);
        },
        [updateUrl],
    );

    const handleGenreChange = useCallback(
        (genres: string[]) => {
            baseHandleGenreChange(genres);
            setPage(1);
        },
        [baseHandleGenreChange],
    );

    const handleSeasonChange = useCallback(
        (newSeasonYear: SeasonYear) => {
            setSeasonYear(newSeasonYear);
            setPage(1);
            updateUrl("seasonal", newSeasonYear, 1);
        },
        [updateUrl],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            setPage(newPage);
            updateUrl("seasonal", seasonYear, newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [seasonYear, updateUrl],
    );

    const handleDayChange = useCallback((day: DayOfWeek) => {
        setActiveDay(day);
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Calendar</h1>
                <p className={styles.subtitle}>
                    {view === "seasonal" ? "Browse anime by season and year" : "Currently airing anime by day"}
                </p>
            </div>

            <div className={styles.viewTabs}>
                <button
                    className={`${styles.viewTab} ${view === "seasonal" ? styles.active : ""}`}
                    onClick={() => handleViewChange("seasonal")}
                >
                    <i className="bi bi-calendar3" />
                    <span>Seasonal</span>
                </button>
                <button
                    className={`${styles.viewTab} ${view === "schedule" ? styles.active : ""}`}
                    onClick={() => handleViewChange("schedule")}
                >
                    <i className="bi bi-clock" />
                    <span>Schedule</span>
                </button>
            </div>

            {view === "seasonal" ? (
                <>
                    <div className={styles.selectorWrapper}>
                        <SeasonSelector value={seasonYear} onChange={handleSeasonChange} />
                    </div>

                    <div className={styles.genreFilterWrapper}>
                        <GenreFilter
                            genres={allGenres}
                            selected={selectedGenres}
                            onChange={handleGenreChange}
                            loading={genresLoading}
                            defaultCollapsed
                        />
                    </div>

                    {seasonalLoading ? (
                        <div className={styles.loading}>
                            <Spinner text="Loading..." />
                        </div>
                    ) : seasonalAnime.length > 0 ? (
                        <>
                            <div className={styles.resultInfo}>
                                <span>
                                    {selectedGenres.length > 0
                                        ? `${filteredCount} of ${totalCount} anime`
                                        : `${totalCount} anime found`}{" "}
                                    for {seasonYear.season.charAt(0).toUpperCase()}
                                    {seasonYear.season.slice(1)} {seasonYear.year}
                                </span>
                            </div>

                            <div className={styles.grid}>
                                {seasonalAnime.map(item => (
                                    <AnimeCard key={item.mal_id} anime={item} showStartDate />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    ) : (
                        <div className={styles.empty}>
                            <i className="bi bi-calendar-x" />
                            <h3>No anime found</h3>
                            <p>
                                {selectedGenres.length > 0
                                    ? `No anime match the selected genres for ${seasonYear.season.charAt(0).toUpperCase()}${seasonYear.season.slice(1)} ${seasonYear.year}`
                                    : `There are no anime for ${seasonYear.season.charAt(0).toUpperCase()}${seasonYear.season.slice(1)} ${seasonYear.year}`}
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {scheduleLoading ? (
                        <div className={styles.loading}>
                            <Spinner text="Loading schedule..." />
                        </div>
                    ) : scheduleError ? (
                        <div className={styles.error}>
                            <i className="bi bi-exclamation-triangle" />
                            <h3>Failed to load schedule</h3>
                            <p>{scheduleError}</p>
                        </div>
                    ) : (
                        <>
                            {lastUpdated && (
                                <p className={styles.lastUpdated}>
                                    Last updated: {new Date(lastUpdated).toLocaleString()}
                                </p>
                            )}

                            <div className={styles.dayTabs}>
                                {displayDays.map(day => {
                                    const count = getAnimeForDay(day).length;
                                    const isToday = day === todayDay;
                                    const isActive = day === activeDay;
                                    return (
                                        <button
                                            key={day}
                                            className={`${styles.dayTab} ${isActive ? styles.active : ""} ${isToday ? styles.today : ""}`}
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
                        </>
                    )}
                </>
            )}
        </div>
    );
}
