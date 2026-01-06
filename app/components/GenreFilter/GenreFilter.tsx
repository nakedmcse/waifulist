"use client";

import React, { useMemo, useState } from "react";
import styles from "./GenreFilter.module.scss";

type GenreFilterProps = {
    genres: string[];
    selected: string[];
    onChange: (genres: string[]) => void;
    loading?: boolean;
};

export function GenreFilter({ genres, selected, onChange, loading }: GenreFilterProps) {
    const [collapsed, setCollapsed] = useState(false);
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
    };

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={() => setCollapsed(!collapsed)}>
                <div className={styles.headerTitle}>
                    <i className="bi bi-funnel"></i>
                    <span>Genres</span>
                    {selected.length > 0 && <span className={styles.badge}>{selected.length}</span>}
                </div>
                <i className={`bi bi-chevron-${collapsed ? "down" : "up"}`}></i>
            </div>

            {!collapsed && (
                <div className={styles.content}>
                    {selected.length > 0 && (
                        <button className={styles.clearButton} onClick={handleClearAll}>
                            <i className="bi bi-x-circle"></i>
                            Clear all
                        </button>
                    )}

                    {loading ? (
                        <div className={styles.loading}>Loading genres...</div>
                    ) : (
                        <>
                            <div className={styles.searchWrapper}>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search genres..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                            <div className={styles.genreList}>
                                {filteredGenres.map(genre => (
                                    <label key={genre} className={styles.genreItem}>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(genre)}
                                            onChange={() => handleToggle(genre)}
                                        />
                                        <span className={styles.checkmark}></span>
                                        <span className={styles.genreName}>{genre}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
