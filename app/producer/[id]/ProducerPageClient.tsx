"use client";

import React, { useMemo, useRef, useState } from "react";
import { Anime } from "@/types/anime";
import { ProducerFull } from "@/types/producer";
import { AnimeType, ProducerAnimeEntry } from "@/services/backend/scraper/types";
import { formatLongText } from "@/lib/utils/textUtils";
import {
    ContentTabsWrapper,
    EntityPageLayout,
    PageHeader,
    SidebarItem,
    SidebarLink,
    SidebarStatRow,
    SidebarStats,
    TagList,
    TextSection,
} from "@/components/EntityPageLayout/EntityPageLayout";
import { AnimeCard } from "@/components/AnimeCard/AnimeCard";
import { Pill } from "@/components/Pill/Pill";
import { PillTab, PillTabs } from "@/components/PillTabs/PillTabs";
import styles from "./page.module.scss";

interface ProducerPageClientProps {
    producer: ProducerFull;
    entries: ProducerAnimeEntry[];
    animeList: Anime[];
}

const TYPE_ORDER: AnimeType[] = ["TV", "ONA", "OVA", "Movie", "Other"];

function formatEstablished(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

const PAGE_SIZE = 24;

type SortOption = "score" | "date-desc" | "date-asc" | "popularity" | "title";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "score", label: "Score" },
    { value: "date-desc", label: "Newest" },
    { value: "date-asc", label: "Oldest" },
    { value: "popularity", label: "Popularity" },
    { value: "title", label: "Title" },
];

function parseDateValue(dateStr: string | undefined): number {
    if (!dateStr) {
        return 0;
    }
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
        return parsed;
    }
    return 0;
}

function sortAnimeList(animeList: Anime[], sortBy: SortOption): Anime[] {
    const sorted = [...animeList];
    switch (sortBy) {
        case "score":
            return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
        case "date-desc":
            return sorted.sort((a, b) => {
                const aVal = parseDateValue(a.aired?.from);
                const bVal = parseDateValue(b.aired?.from);
                if (aVal === 0 && bVal === 0) {
                    return 0;
                }
                if (aVal === 0) {
                    return 1;
                }
                if (bVal === 0) {
                    return -1;
                }
                return bVal - aVal;
            });
        case "date-asc":
            return sorted.sort((a, b) => {
                const aVal = parseDateValue(a.aired?.from);
                const bVal = parseDateValue(b.aired?.from);
                if (aVal === 0 && bVal === 0) {
                    return 0;
                }
                if (aVal === 0) {
                    return 1;
                }
                if (bVal === 0) {
                    return -1;
                }
                return aVal - bVal;
            });
        case "popularity":
            return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        case "title":
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        default:
            return sorted;
    }
}

interface AnimeGridProps {
    animeList: Anime[];
}

function AnimeGrid({ animeList }: AnimeGridProps) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("score");
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredAnime = searchQuery.trim()
        ? animeList.filter(
              anime =>
                  anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  anime.title_english?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : animeList;
    const sortedAnime = sortAnimeList(filteredAnime, sortBy);
    const displayedAnime = sortedAnime.slice(0, visibleCount);
    const remaining = sortedAnime.length - visibleCount;

    const handleShowMore = () => {
        setVisibleCount(prev => prev + PAGE_SIZE);
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }, 0);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setVisibleCount(PAGE_SIZE);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortOption);
        setVisibleCount(PAGE_SIZE);
    };

    return (
        <div className={styles.animeGridWrapper}>
            <div className={styles.searchBar}>
                <i className="bi bi-search" />
                <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />
                <div className={styles.sortWrapper}>
                    <span className={styles.sortLabel}>Sort:</span>
                    <select value={sortBy} onChange={handleSortChange} className={styles.sortSelect}>
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div ref={scrollRef} className={styles.animeGridScroll}>
                {sortedAnime.length === 0 ? (
                    <p className={styles.emptyMessage}>No anime found matching &ldquo;{searchQuery}&rdquo;</p>
                ) : (
                    <div className={styles.animeGrid}>
                        {displayedAnime.map(anime => (
                            <AnimeCard key={anime.mal_id} anime={anime} showStatus={false} />
                        ))}
                    </div>
                )}
            </div>
            {remaining > 0 && (
                <button className={styles.showMoreButton} onClick={handleShowMore}>
                    Show {Math.min(remaining, PAGE_SIZE)} more
                </button>
            )}
        </div>
    );
}

interface AnimeTypeSectionProps {
    animeList: Anime[];
    typeMap: Map<number, AnimeType>;
}

function AnimeTypeSection({ animeList, typeMap }: AnimeTypeSectionProps) {
    const grouped = useMemo(() => {
        const groups = new Map<string, Anime[]>();
        groups.set("All", animeList);

        for (const anime of animeList) {
            const type = typeMap.get(anime.mal_id) || "Other";
            const normalizedType = TYPE_ORDER.includes(type) ? type : "Other";
            const existing = groups.get(normalizedType) || [];
            existing.push(anime);
            groups.set(normalizedType, existing);
        }

        return groups;
    }, [animeList, typeMap]);

    const tabs: PillTab[] = [{ id: "All", label: "All", count: animeList.length }];

    for (const type of TYPE_ORDER) {
        const count = grouped.get(type)?.length || 0;
        if (count > 0) {
            tabs.push({ id: type, label: type, count });
        }
    }

    const renderContent = (tabId: string) => {
        const list = grouped.get(tabId) || [];
        return <AnimeGrid animeList={list} />;
    };

    return <PillTabs tabs={tabs} defaultTab="All" renderContent={renderContent} />;
}

interface AnimeSectionProps {
    entries: ProducerAnimeEntry[];
    animeList: Anime[];
}

function AnimeSection({ entries, animeList }: AnimeSectionProps) {
    const { typeMap, animeByRole, roles } = useMemo(() => {
        const typeMap = new Map<number, AnimeType>();
        const roleMap = new Map<number, string>();

        for (const entry of entries) {
            typeMap.set(entry.mal_id, entry.type);
            roleMap.set(entry.mal_id, entry.role);
        }

        const animeByRole = new Map<string, Anime[]>();
        const roleSet = new Set<string>();

        for (const anime of animeList) {
            const role = roleMap.get(anime.mal_id) || "Studio";
            roleSet.add(role);
            const existing = animeByRole.get(role) || [];
            existing.push(anime);
            animeByRole.set(role, existing);
        }

        const roles = Array.from(roleSet).sort((a, b) => {
            if (a === "Studio") {
                return -1;
            }
            if (b === "Studio") {
                return 1;
            }
            return a.localeCompare(b);
        });

        return { typeMap, animeByRole, roles };
    }, [entries, animeList]);

    if (animeList.length === 0) {
        return <p className={styles.emptyMessage}>No anime found for this studio.</p>;
    }

    if (roles.length === 1) {
        return (
            <div className={styles.animeSection}>
                <AnimeTypeSection animeList={animeList} typeMap={typeMap} />
            </div>
        );
    }

    const tabs: PillTab[] = roles.map(role => ({
        id: role,
        label: role,
        count: animeByRole.get(role)?.length || 0,
    }));

    const renderContent = (tabId: string) => {
        const list = animeByRole.get(tabId) || [];
        return <AnimeTypeSection animeList={list} typeMap={typeMap} />;
    };

    return (
        <div className={styles.animeSection}>
            <PillTabs tabs={tabs} defaultTab={roles[0]} renderContent={renderContent} />
        </div>
    );
}

export function ProducerPageClient({ producer, entries, animeList }: ProducerPageClientProps) {
    const imageUrl = producer.images?.jpg?.image_url;
    const aboutParagraphs = producer.about ? formatLongText(producer.about) : [];

    const defaultTitle = producer.titles.find(t => t.type === "Default")?.title || "Unknown";
    const japaneseTitle = producer.titles.find(t => t.type === "Japanese")?.title;
    const otherTitles = producer.titles.filter(t => t.type !== "Default" && t.type !== "Japanese");

    const sidebarContent = (
        <>
            <SidebarItem icon="heart-fill" iconColor="#ec4899">
                {producer.favorites.toLocaleString()} favourites
            </SidebarItem>
            <SidebarLink href={producer.url} icon="box-arrow-up-right" external>
                View on MyAnimeList
            </SidebarLink>
            <SidebarStats>
                {producer.established && (
                    <SidebarStatRow label="Established" value={formatEstablished(producer.established)} />
                )}
                <SidebarStatRow label="Anime Count" value={producer.count} />
            </SidebarStats>
        </>
    );

    return (
        <EntityPageLayout imageUrl={imageUrl} imageAlt={defaultTitle} sidebarContent={sidebarContent}>
            <PageHeader title={defaultTitle} subtitle={japaneseTitle} />

            {otherTitles.length > 0 && (
                <TagList>
                    {otherTitles.map((title, i) => (
                        <Pill key={i}>{title.title}</Pill>
                    ))}
                </TagList>
            )}

            <TextSection paragraphs={aboutParagraphs} />

            {animeList.length > 0 && (
                <ContentTabsWrapper>
                    <AnimeSection entries={entries} animeList={animeList} />
                </ContentTabsWrapper>
            )}
        </EntityPageLayout>
    );
}
