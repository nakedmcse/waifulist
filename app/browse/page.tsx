"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Anime } from "@/types/anime";
import { useAnime } from "@/hooks";
import { useLoading } from "@/contexts/LoadingContext";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { AnimeCard } from "@/components/AnimeCard/AnimeCard";
import { Pagination } from "@/components/Pagination/Pagination";
import styles from "./page.module.scss";

const PAGE_SIZE = 100;

function BrowseContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const { searchAnimeSilent, getPopularAnimeSilent } = useAnime();
    const { isLoading } = useLoading();

    const [anime, setAnime] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(initialQuery);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const searchIdRef = useRef(0);
    const initialLoadDone = useRef(false);

    const isSearching = query.trim().length > 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const performSearch = useCallback(
        async (searchQuery: string, pageNum: number = 1) => {
            const searchId = ++searchIdRef.current;
            setLoading(true);

            try {
                if (searchQuery.trim()) {
                    const results = await searchAnimeSilent(searchQuery, 20);
                    if (searchId === searchIdRef.current) {
                        setAnime(results);
                        setTotalCount(results.length);
                        setLoading(false);
                    }
                } else {
                    const offset = (pageNum - 1) * PAGE_SIZE;
                    const result = await getPopularAnimeSilent(PAGE_SIZE, offset);
                    if (searchId === searchIdRef.current) {
                        setAnime(result.anime);
                        setTotalCount(result.total);
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Search failed:", error);
                if (searchId === searchIdRef.current) {
                    setLoading(false);
                }
            }
        },
        [searchAnimeSilent, getPopularAnimeSilent],
    );

    useEffect(() => {
        if (initialLoadDone.current) {
            return;
        }
        initialLoadDone.current = true;
        performSearch(initialQuery, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLiveSearch = useCallback(
        (newQuery: string) => {
            setQuery(newQuery);
            setPage(1);
            performSearch(newQuery, 1);

            const url = new URL(window.location.href);
            if (newQuery) {
                url.searchParams.set("q", newQuery);
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState({}, "", url);
        },
        [performSearch],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            setPage(newPage);
            performSearch(query, newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [performSearch, query],
    );

    const showLoading = loading && !isLoading;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Browse Anime</h1>
                    <p className={styles.subtitle}>
                        {query ? `Search results for "${query}"` : "Discover top rated anime"}
                    </p>
                </div>

                <div className={styles.searchWrapper}>
                    <SearchBar
                        initialValue={query}
                        onLiveSearch={handleLiveSearch}
                        placeholder="Search anime by title..."
                        debounceMs={250}
                    />
                </div>

                {showLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Searching...</p>
                    </div>
                ) : anime.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {anime.map(item => (
                                <AnimeCard key={item.id} anime={item} />
                            ))}
                        </div>

                        {!isSearching && (
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                        )}
                    </>
                ) : (
                    <div className={styles.empty}>
                        <i className="bi bi-search" />
                        <h3>No results found</h3>
                        <p>Try searching with different keywords</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense
            fallback={
                <div className={styles.page}>
                    <div className={styles.container}>
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <BrowseContent />
        </Suspense>
    );
}
