"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { FriendRating } from "@/types/anime";
import { fetchFriendsRatings } from "@/services/friendsRatingsService";

export function useFriendsRatings(animeId: number) {
    const { user } = useAuth();
    const [ratings, setRatings] = useState<FriendRating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        if (!user) {
            Promise.resolve().then(() => {
                if (!cancelled) {
                    setRatings([]);
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

        fetchFriendsRatings(animeId).then(data => {
            if (!cancelled) {
                setRatings(data);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [user, animeId]);

    return {
        ratings,
        loading,
    };
}
