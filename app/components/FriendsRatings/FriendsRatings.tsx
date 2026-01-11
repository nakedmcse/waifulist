"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import { useFriendsRatings } from "@/hooks/useFriendsRatings";
import styles from "./FriendsRatings.module.scss";

interface FriendsRatingsProps {
    animeId: number;
}

function RatingDisplay({ rating }: { rating: number | null }) {
    if (rating === null || rating === 0) {
        return <span className={styles.noRating}>Not rated</span>;
    }

    if (rating === -1) {
        return <span className={styles.dogshit}>💩</span>;
    }

    if (rating === 6) {
        return <span className={styles.masterpiece}>⭐ Masterpiece</span>;
    }

    return (
        <span className={styles.stars}>
            {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={`bi bi-star${i < rating ? "-fill" : ""}`} />
            ))}
        </span>
    );
}

export function FriendsRatings({ animeId }: FriendsRatingsProps) {
    const { user } = useAuth();
    const { ratings, loading } = useFriendsRatings(animeId);
    const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

    const toggleNotes = (publicId: string) => {
        setExpandedNotes(prev => {
            const next = new Set(prev);
            if (next.has(publicId)) {
                next.delete(publicId);
            } else {
                next.add(publicId);
            }
            return next;
        });
    };

    if (!user || loading) {
        return null;
    }

    if (ratings.length === 0) {
        return null;
    }

    return (
        <div className={styles.section}>
            <h3 className={styles.title}>
                <i className="bi bi-people-fill" />
                Friends&apos; Ratings
                <span className={styles.count}>{ratings.length}</span>
            </h3>
            <div className={styles.grid}>
                {ratings.map(friend => (
                    <div key={friend.publicId} className={styles.card}>
                        <Link href={`/list/${friend.publicId}`} className={styles.cardLink}>
                            <div className={styles.avatar}>
                                <i className="bi bi-person-circle" />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.username}>{friend.username}</span>
                                <div className={styles.meta}>
                                    <RatingDisplay rating={friend.rating} />
                                    <StatusBadge status={friend.status} compact />
                                </div>
                            </div>
                        </Link>
                        {friend.notes && (
                            <div className={styles.notesSection}>
                                <button className={styles.notesToggle} onClick={() => toggleNotes(friend.publicId)}>
                                    <i
                                        className={`bi bi-chat-text${expandedNotes.has(friend.publicId) ? "-fill" : ""}`}
                                    />
                                    {expandedNotes.has(friend.publicId) ? "Hide note" : "Show note"}
                                </button>
                                {expandedNotes.has(friend.publicId) && <p className={styles.notes}>{friend.notes}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
