"use client";

import React, { useMemo, useState } from "react";
import styles from "./GenreFilter.module.scss";

type GenreFilterProps = {
    genres: string[];
    selected: string[];
    onChange: (genres: string[]) => void;
    loading?: boolean;
    defaultCollapsed?: boolean;
};

export function GenreFilter({ genres, selected, onChange, loading, defaultCollapsed = false }: GenreFilterProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [search, setSearch] = useState("");

    const filteredGenres = useMemo(() => {
        if (!search.trim()) {
            return genres;
        }
        const lower = search.toLowerCase();
        return genres.filter(g => g.toLowerCase().includes(lower));
    }, [genres, search]);

    const handleToggle = (genre: string) => {
        if (selected.includes(genre)) {
            onChange(selected.filter(g => g !== genre));
        } else {
            onChange([...selected, genre]);
        }
    };

    const handleClearAll = () => {
        onChange([]);
        setSearch("");
    };

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={() => setCollapsed(!collapsed)}>
                <div className={styles.headerLeft}>
                    <i className="bi bi-funnel" />
                    <span>Filter by Genre</span>
                    {selected.length > 0 && <span className={styles.badge}>{selected.length}</span>}
                </div>
                <div className={styles.headerRight}>
                    {selected.length > 0 && !collapsed && (
                        <button
                            className={styles.clearButton}
                            onClick={e => {
                                e.stopPropagation();
                                handleClearAll();
                            }}
                        >
                            Clear
                        </button>
                    )}
                    <i className={`bi bi-chevron-${collapsed ? "down" : "up"}`} />
                </div>
            </div>

            {!collapsed && (
                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Loading genres...</div>
                    ) : (
                        <>
                            <div className={styles.searchWrapper}>
                                <i className="bi bi-search" />
                                <input
                                    type="text"
                                    placeholder="Search genres..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className={styles.searchInput}
                                    onClick={e => e.stopPropagation()}
                                />
                                {search && (
                                    <button
                                        className={styles.clearSearch}
                                        onClick={e => {
                                            e.stopPropagation();
                                            setSearch("");
                                        }}
                                    >
                                        <i className="bi bi-x" />
                                    </button>
                                )}
                            </div>
                            <div className={styles.chipList}>
                                {filteredGenres.map(genre => (
                                    <button
                                        key={genre}
                                        className={`${styles.chip} ${selected.includes(genre) ? styles.selected : ""}`}
                                        onClick={() => handleToggle(genre)}
                                    >
                                        {genre}
                                        {selected.includes(genre) && <i className="bi bi-check" />}
                                    </button>
                                ))}
                                {filteredGenres.length === 0 && (
                                    <span className={styles.noResults}>No genres match &quot;{search}&quot;</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
