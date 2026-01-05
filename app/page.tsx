"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Anime, TopReviewWithAnime } from "@/types/anime";
import { useAnime } from "@/hooks";
import { useWatchList } from "@/contexts/WatchListContext";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { AnimeCard } from "@/components/AnimeCard/AnimeCard";
import { ReviewCard } from "@/components/ReviewCard/ReviewCard";
import styles from "./page.module.scss";

export default function Home() {
    const router = useRouter();
    const { getHomePageAnime } = useAnime();
    const { ensureLoaded } = useWatchList();
    const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
    const [reviews, setReviews] = useState<TopReviewWithAnime[]>([]);

    useEffect(() => {
        ensureLoaded();
    }, [ensureLoaded]);

    const handleLiveSearch = useCallback(
        (query: string) => {
            if (query.trim()) {
                router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
            }
        },
        [router],
    );

    useEffect(() => {
        getHomePageAnime().then(({ popular, reviews }) => {
            setPopularAnime(popular);
            setReviews(reviews);
        });
    }, [getHomePageAnime]);

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>
                        Track Your <span className={styles.accent}>Anime</span> Journey
                    </h1>
                    <p className={styles.subtitle}>
                        Keep track of what you&apos;re watching, plan your next binge, and never forget where you left
                        off.
                    </p>
                    <div className={styles.searchWrapper}>
                        <SearchBar onLiveSearch={handleLiveSearch} placeholder="Search for anime..." />
                    </div>
                </div>
            </section>

            {reviews.length > 0 && (
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2>Recent Reviews</h2>
                        </div>
                        <div className={styles.reviewsGrid}>
                            {reviews.map(review => (
                                <ReviewCard key={review.mal_id} review={review} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Top Rated</h2>
                        <a href="/browse" className={styles.viewAll}>
                            View all <i className="bi bi-arrow-right" />
                        </a>
                    </div>
                    <div className={styles.grid}>
                        {popularAnime.map(anime => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
