"use client";

import Link from "next/link";
import type { BookmarkedUser } from "@/lib/db";
import styles from "./BookmarkedUsersSection.module.scss";
import { formatDate } from "@/lib/dateUtils";

interface BookmarkedUsersSectionProps {
    bookmarks: BookmarkedUser[];
    onRemove: (publicId: string) => void;
}

export function BookmarkedUsersSection({ bookmarks, onRemove }: BookmarkedUsersSectionProps) {
    if (bookmarks.length === 0) {
        return null;
    }

    return (
        <div className={styles.section}>
            <h2 className={styles.title}>
                <i className="bi bi-bookmark-fill" />
                Bookmarked Lists
            </h2>
            <div className={styles.grid}>
                {bookmarks.map(bookmark => (
                    <div key={bookmark.public_id} className={styles.card}>
                        <div className={styles.cardActions}>
                            <Link
                                href={`/compare/${bookmark.public_id}`}
                                className={styles.compareButton}
                                title="Compare lists"
                                aria-label={`Compare with ${bookmark.username}`}
                            >
                                <i className="bi bi-arrow-left-right" />
                            </Link>
                            <button
                                className={styles.removeButton}
                                onClick={() => onRemove(bookmark.public_id)}
                                title="Remove bookmark"
                                aria-label={`Remove ${bookmark.username} from bookmarks`}
                            >
                                <i className="bi bi-x" />
                            </button>
                        </div>
                        <Link href={`/list/${bookmark.public_id}`} className={styles.cardLink}>
                            <div className={styles.avatar}>
                                <i className="bi bi-person-circle" />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.username}>{bookmark.username}</span>
                                <span className={styles.stats}>
                                    <span className={styles.watching}>{bookmark.watching_count} watching</span>
                                    <span className={styles.separator}>·</span>
                                    <span className={styles.completed}>{bookmark.completed_count} completed</span>
                                </span>
                                <span className={styles.meta}>
                                    {bookmark.last_activity
                                        ? `Updated ${formatDate(bookmark.last_activity)}`
                                        : "No activity"}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
