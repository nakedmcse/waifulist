"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicTierLists } from "@/hooks/useTierList";
import { Spinner } from "@/components/Spinner/Spinner";
import { Button } from "@/components/Button/Button";
import { TierListCard } from "@/components/TierListCard";
import styles from "./page.module.scss";

export function BrowseTierListsClient() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const options = useMemo(
        () => ({
            page,
            limit: 12,
            search: debouncedSearch || undefined,
            sort,
        }),
        [page, debouncedSearch, sort],
    );

    const { tierLists, loading, error, totalPages, refresh } = usePublicTierLists(options);

    const handleSortChange = (newSort: "newest" | "oldest" | "name") => {
        setSort(newSort);
        setPage(1);
    };

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.error}>
                        <p>{error}</p>
                        <Button onClick={refresh}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Browse Tier Lists</h1>
                    <Button onClick={() => router.push("/tierlist/create")}>
                        <i className="bi bi-plus-lg" /> Create
                    </Button>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <i className="bi bi-search" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.sortButtons}>
                        <button
                            className={sort === "newest" ? styles.active : ""}
                            onClick={() => handleSortChange("newest")}
                        >
                            Newest
                        </button>
                        <button
                            className={sort === "oldest" ? styles.active : ""}
                            onClick={() => handleSortChange("oldest")}
                        >
                            Oldest
                        </button>
                        <button
                            className={sort === "name" ? styles.active : ""}
                            onClick={() => handleSortChange("name")}
                        >
                            Name
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner text="Loading tier lists..." />
                    </div>
                ) : tierLists.length === 0 ? (
                    <div className={styles.empty}>
                        <i className="bi bi-list-ol" />
                        <p>No public tier lists found.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.grid}>
                            {tierLists.map(tierList => (
                                <TierListCard
                                    key={tierList.publicId}
                                    publicId={tierList.publicId}
                                    name={tierList.name}
                                    characterCount={tierList.characterCount}
                                    previewCharacterIds={tierList.previewCharacterIds}
                                    updatedAt={tierList.updatedAt}
                                    username={tierList.username}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                    <i className="bi bi-chevron-left" /> Previous
                                </button>
                                <span className={styles.pageInfo}>
                                    Page {page} of {totalPages}
                                </span>
                                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                    Next <i className="bi bi-chevron-right" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
