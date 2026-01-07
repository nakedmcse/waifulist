"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anime } from "@/types/anime";
import { getAllSeasons, getCurrentSeason, Season, SeasonYear } from "@/lib/seasonUtils";
import { SeasonSelector } from "@/components/SeasonSelector/SeasonSelector";
import { AnimeCard } from "@/components/AnimeCard/AnimeCard";
import { Pagination } from "@/components/Pagination/Pagination";
import { GenreFilter } from "@/components/GenreFilter/GenreFilter";
import { useWatchList } from "@/contexts/WatchListContext";
import { useGenreFilter } from "@/hooks";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.scss";

const PAGE_SIZE = 24;
const VALID_SEASONS = new Set<string>(getAllSeasons());

function parseSeasonParam(param: string | null): Season | null {
    if (!param) {
        return null;
    }
    return VALID_SEASONS.has(param) ? (param as Season) : null;
}

function parseYearParam(param: string | null): number | null {
    if (!param) {
        return null;
    }
    const year = parseInt(param, 10);
    if (isNaN(year) || year < 1970 || year > new Date().getFullYear() + 1) {
        return null;
    }
    return year;
}

export function SeasonalPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ensureLoaded } = useWatchList();
    const { allGenres, selectedGenres, genresLoading, handleGenreChange } = useGenreFilter();

    const seasonParam = parseSeasonParam(searchParams.get("season"));
    const yearParam = parseYearParam(searchParams.get("year"));
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const defaultSeason = getCurrentSeason();
    const initialSeason: SeasonYear = {
        season: seasonParam || defaultSeason.season,
        year: yearParam || defaultSeason.year,
    };

    const [seasonYear, setSeasonYear] = useState<SeasonYear>(initialSeason);
    const [anime, setAnime] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(pageParam);
    const [totalCount, setTotalCount] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);

    const totalPages = Math.ceil(filteredCount / PAGE_SIZE);

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    const fetchSeasonalAnime = useCallback(
        async (seasonYear: SeasonYear, pageNum: number) => {
            setLoading(true);
            try {
                const offset = (pageNum - 1) * PAGE_SIZE;
                const params = new URLSearchParams({
                    year: seasonYear.year.toString(),
                    season: seasonYear.season,
                    limit: PAGE_SIZE.toString(),
                    offset: offset.toString(),
                });
                if (selectedGenres.length > 0) {
                    params.set("genres", selectedGenres.join(","));
                }
                const response = await fetch(`/api/anime/seasonal?${params.toString()}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch seasonal anime");
                }

                const data = await response.json();
                setAnime(data.anime);
                setTotalCount(data.total);
                setFilteredCount(data.filtered);
            } catch (error) {
                console.error("Failed to fetch seasonal anime:", error);
                setAnime([]);
                setTotalCount(0);
                setFilteredCount(0);
            } finally {
                setLoading(false);
            }
        },
        [selectedGenres],
    );

    useEffect(() => {
        fetchSeasonalAnime(seasonYear, page);
    }, [seasonYear, page, fetchSeasonalAnime]);

    useEffect(() => {
        setPage(1);
    }, [selectedGenres]);

    const updateUrl = useCallback(
        (newSeasonYear: SeasonYear, newPage: number) => {
            const url = new URL(window.location.href);
            url.searchParams.set("year", newSeasonYear.year.toString());
            url.searchParams.set("season", newSeasonYear.season);
            if (newPage > 1) {
                url.searchParams.set("page", newPage.toString());
            } else {
                url.searchParams.delete("page");
            }
            router.replace(url.pathname + url.search, { scroll: false });
        },
        [router],
    );

    const handleSeasonChange = useCallback(
        (newSeasonYear: SeasonYear) => {
            setSeasonYear(newSeasonYear);
            setPage(1);
            updateUrl(newSeasonYear, 1);
        },
        [updateUrl],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            setPage(newPage);
            updateUrl(seasonYear, newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [seasonYear, updateUrl],
    );

    return (
        <div className={styles.page}>
            <aside className={styles.sidebar}>
                <GenreFilter
                    genres={allGenres}
                    selected={selectedGenres}
                    onChange={handleGenreChange}
                    loading={genresLoading}
                />
            </aside>
            <div className={styles.main}>
                <div className={styles.header}>
                    <h1>Seasonal Anime</h1>
                    <p className={styles.subtitle}>Browse anime by season and year</p>
                </div>

                <div className={styles.selectorWrapper}>
                    <SeasonSelector value={seasonYear} onChange={handleSeasonChange} />
                </div>

                <div className={styles.mobileGenreFilter}>
                    <GenreFilter
                        genres={allGenres}
                        selected={selectedGenres}
                        onChange={handleGenreChange}
                        loading={genresLoading}
                        defaultCollapsed
                    />
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <Spinner text="Loading..." />
                    </div>
                ) : anime.length > 0 ? (
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
                            {anime.map(item => (
                                <AnimeCard key={item.mal_id} anime={item} showStartDate />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
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
            </div>
        </div>
    );
}
