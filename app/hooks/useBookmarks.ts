"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { BookmarkedUser } from "@/lib/db";
import {
    addBookmark as addBookmarkService,
    checkBookmark,
    fetchBookmarks,
    removeBookmark as removeBookmarkService,
} from "@/services/bookmarkService";

export function useBookmarks() {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState<BookmarkedUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        if (!user) {
            Promise.resolve().then(() => {
                if (!cancelled) {
                    setBookmarks([]);
                    setLoading(false);
                }
            });
            return () => {
                cancelled = true;
            };
        }

        Promise.resolve().then(() => {
            if (!cancelled) {
                setLoading(true);
            }
        });

        fetchBookmarks().then(data => {
            if (!cancelled) {
                setBookmarks(data);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [user]);

    const refresh = useCallback(async () => {
        if (!user) {
            return;
        }
        setLoading(true);
        const data = await fetchBookmarks();
        setBookmarks(data);
        setLoading(false);
    }, [user]);

    const addBookmark = useCallback(
        async (publicId: string): Promise<boolean> => {
            const success = await addBookmarkService(publicId);
            if (success) {
                await refresh();
            }
            return success;
        },
        [refresh],
    );

    const removeBookmark = useCallback(
        async (publicId: string): Promise<boolean> => {
            setBookmarks(prev => prev.filter(b => b.public_id !== publicId));
            const success = await removeBookmarkService(publicId);
            if (!success) {
                await refresh();
            }
            return success;
        },
        [refresh],
    );

    return {
        bookmarks,
        loading,
        addBookmark,
        removeBookmark,
        refresh,
    };
}

export function useBookmarkStatus(targetUuid: string) {
    const { user, loading: authLoading } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (authLoading) {
            return;
        }

        if (!user) {
            Promise.resolve().then(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
            return () => {
                cancelled = true;
            };
        }

        Promise.resolve().then(() => {
            if (!cancelled) {
                setLoading(true);
            }
        });

        checkBookmark(targetUuid).then(result => {
            if (!cancelled) {
                setIsBookmarked(result);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [user, authLoading, targetUuid]);

    const toggle = useCallback(async (): Promise<boolean> => {
        if (toggling) {
            return false;
        }

        setToggling(true);
        const wasBookmarked = isBookmarked;
        setIsBookmarked(!wasBookmarked);

        const success = wasBookmarked ? await removeBookmarkService(targetUuid) : await addBookmarkService(targetUuid);

        if (!success) {
            setIsBookmarked(wasBookmarked);
        }

        setToggling(false);
        return success;
    }, [toggling, isBookmarked, targetUuid]);

    const isOwnList = user?.publicId === targetUuid;
    const shouldShow = !authLoading && !loading && user && !isOwnList;

    return {
        isBookmarked,
        loading: authLoading || loading,
        toggling,
        toggle,
        shouldShow,
    };
}
