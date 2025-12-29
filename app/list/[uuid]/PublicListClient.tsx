"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Anime, SortType } from "@/types/anime";
import { PublicListItem, usePublicList } from "@/hooks";
import { AnimeListView, WatchedItem } from "@/components/AnimeListView/AnimeListView";
import { LocalStorage, STORAGE_KEYS } from "@/constants/localStorage";

function getStoredSort(): SortType {
    const stored = LocalStorage.getString(STORAGE_KEYS.PUBLIC_LIST_SORT);
    if (stored && ["added", "name", "rating", "rating (personal)"].includes(stored)) {
        return stored as SortType;
    }
    return "added";
}

interface PublicListClientProps {
    uuid: string;
    initialUsername: string;
}

export function PublicListClient({ uuid, initialUsername }: PublicListClientProps) {
    const { fetchPublicList } = usePublicList();

    const [username] = useState<string>(initialUsername);
    const [watchedItems, setWatchedItems] = useState<WatchedItem[]>([]);
    const [animeData, setAnimeData] = useState<Map<number, Anime>>(new Map());
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<SortType>(getStoredSort);

    const handleSortChange = useCallback((newSort: SortType) => {
        setSort(newSort);
        LocalStorage.setString(STORAGE_KEYS.PUBLIC_LIST_SORT, newSort);
    }, []);

    useEffect(() => {
        fetchPublicList(uuid).then(result => {
            if (!("error" in result)) {
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
            setLoading(false);
        });
    }, [uuid, fetchPublicList]);

    return (
        <AnimeListView
            title={`${username}'s Anime List`}
            subtitle={`${watchedItems.length} anime in this list`}
            watchedItems={watchedItems}
            animeData={animeData}
            loading={loading}
            showStatusBadge={false}
            initialSort={sort}
            onSortChange={handleSortChange}
        />
    );
}
