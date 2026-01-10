"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCharacterPreviews } from "@/hooks/useTierList";
import styles from "./TierListCard.module.scss";

interface TierListCardProps {
    publicId: string;
    name: string;
    characterCount: number;
    previewCharacterIds?: number[];
    updatedAt: string;
    username?: string;
    isPublic?: boolean;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function TierListCard({
    publicId,
    name,
    characterCount,
    previewCharacterIds = [],
    updatedAt,
    username,
    isPublic,
}: TierListCardProps) {
    const { previews, loading: loadingPreviews } = useCharacterPreviews(previewCharacterIds);
    const hasPreviews = previewCharacterIds.length > 0;

    return (
        <Link href={`/tierlist/${publicId}`} className={styles.card}>
            {hasPreviews && (
                <div className={styles.previews}>
                    {loadingPreviews ? (
                        <div className={styles.previewPlaceholder} />
                    ) : previews.length > 0 ? (
                        previews.map(char => (
                            <Image
                                key={char.id}
                                src={char.image}
                                alt={char.name}
                                width={80}
                                height={80}
                                className={styles.previewImage}
                                unoptimized
                            />
                        ))
                    ) : (
                        <div className={styles.previewEmpty}>
                            <i className="bi bi-image" />
                        </div>
                    )}
                </div>
            )}
            <div className={styles.content}>
                <h3>{name}</h3>
                <div className={styles.meta}>
                    {username && (
                        <span className={styles.username}>
                            <i className="bi bi-person" /> {username}
                        </span>
                    )}
                    <span className={styles.count}>{characterCount} characters</span>
                    {isPublic !== undefined && (
                        <span className={isPublic ? styles.public : styles.private}>
                            <i className={`bi ${isPublic ? "bi-globe" : "bi-lock"}`} />
                            {isPublic ? "Public" : "Private"}
                        </span>
                    )}
                </div>
                <div className={styles.date}>Updated {formatDate(updatedAt)}</div>
            </div>
        </Link>
    );
}
