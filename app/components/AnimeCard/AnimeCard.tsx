"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Anime } from "@/types/anime";
import { useWatchList } from "@/contexts/WatchListContext";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import styles from "./AnimeCard.module.scss";

interface AnimeCardProps {
    anime: Anime;
    showStatus?: boolean;
}

function formatDateAdded(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    }
    if (diffDays === 1) {
        return "Yesterday";
    }
    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
    }
    if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)} months ago`;
    }
    return date.toLocaleDateString();
}

export function AnimeCard({ anime, showStatus = true }: AnimeCardProps) {
    const { getWatchData } = useWatchList();
    const watchData = getWatchData(anime.id);

    const imageUrl = anime.main_picture?.large || anime.main_picture?.medium || "/placeholder.png";

    return (
        <Link href={`/anime/${anime.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <Image
                    src={imageUrl}
                    alt={anime.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    className={styles.image}
                />
                {anime.mean && (
                    <div className={styles.score}>
                        <i className="bi bi-star-fill" />
                        {anime.mean.toFixed(1)}
                    </div>
                )}
                {showStatus && watchData && (
                    <div className={styles.statusBadge}>
                        <StatusBadge status={watchData.status} compact />
                    </div>
                )}
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>{anime.title}</h3>
                <div className={styles.meta}>
                    {anime.media_type && <span className={styles.type}>{anime.media_type.toUpperCase()}</span>}
                    {anime.num_episodes && <span className={styles.episodes}>{anime.num_episodes} eps</span>}
                </div>
                {watchData && (
                    <div className={styles.dateAdded} title={new Date(watchData.dateAdded).toLocaleString()}>
                        <i className="bi bi-calendar-plus" />
                        {formatDateAdded(watchData.dateAdded)}
                    </div>
                )}
            </div>
        </Link>
    );
}
