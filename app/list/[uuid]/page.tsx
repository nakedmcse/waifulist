"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Anime } from "@/types/anime";
import { PublicListItem, usePublicList } from "@/hooks";
import { AnimeListView, WatchedItem } from "@/components/AnimeListView/AnimeListView";
import styles from "@/components/AnimeListView/AnimeListView.module.scss";

export default function PublicListPage() {
    const params = useParams();
    const uuid = params.uuid as string;
    const { fetchPublicList } = usePublicList();

    const [username, setUsername] = useState<string | null>(null);
    const [watchedItems, setWatchedItems] = useState<WatchedItem[]>([]);
    const [animeData, setAnimeData] = useState<Map<number, Anime>>(new Map());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPublicList(uuid).then(result => {
            if ("error" in result) {
                setError(result.error);
            } else {
                setUsername(result.username);
                setWatchedItems(
                    result.items.map((item: PublicListItem) => ({
                        animeId: item.animeId,
                        status: item.status,
                        rating: item.rating,
                        dateAdded: item.dateAdded,
                    })),
                );
                setAnimeData(result.animeData);
            }
        });
    }, [uuid, fetchPublicList]);

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.empty}>
                    <i className="bi bi-exclamation-circle" />
                    <h3>{error}</h3>
                    <p>The list you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                </div>
            </div>
        );
    }

    if (!username) {
        return null;
    }

    return (
        <AnimeListView
            title={`${username}'s Anime List`}
            subtitle={`${watchedItems.length} anime in this list`}
            watchedItems={watchedItems}
            animeData={animeData}
            loading={false}
            showStatusBadge={false}
        />
    );
}
