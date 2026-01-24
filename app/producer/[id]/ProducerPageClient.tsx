"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { Pill } from "@/components/Pill/Pill";
import { PillTab, PillTabs } from "@/components/PillTabs/PillTabs";
import styles from "./page.module.scss";

interface ProducerPageClientProps {
    producer: ProducerFull;
    anime: ProducerAnimeEntry[];
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

function AnimeGrid({ anime }: { anime: ProducerAnimeEntry[] }) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const filteredAnime = searchQuery.trim()
        ? anime.filter(entry => entry.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : anime;
    const sortedAnime = [...filteredAnime].sort((a, b) => (b.score || 0) - (a.score || 0));
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
            </div>
            <div ref={scrollRef} className={styles.animeGridScroll}>
                {sortedAnime.length === 0 ? (
                    <p className={styles.emptyMessage}>No anime found matching &ldquo;{searchQuery}&rdquo;</p>
                ) : (
                    <div className={styles.animeGrid}>
                        {displayedAnime.map(entry => (
                            <Link key={entry.mal_id} href={`/anime/${entry.mal_id}`} className={styles.animeCard}>
                                <div className={styles.animeImage}>
                                    {entry.image_url ? (
                                        <Image src={entry.image_url} alt={entry.title} fill sizes="140px" />
                                    ) : (
                                        <div className={styles.noImage} />
                                    )}
                                </div>
                                <div className={styles.animeInfo}>
                                    <span className={styles.animeTitle}>{entry.title}</span>
                                    <div className={styles.animeMeta}>
                                        {entry.score && (
                                            <span className={styles.animeScore}>
                                                <i className="bi bi-star-fill" /> {entry.score.toFixed(2)}
                                            </span>
                                        )}
                                        {entry.members && (
                                            <span className={styles.animeMembers}>
                                                <i className="bi bi-people-fill" /> {entry.members.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
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

function groupAnimeByType(anime: ProducerAnimeEntry[]): Map<string, ProducerAnimeEntry[]> {
    const groups = new Map<string, ProducerAnimeEntry[]>();

    groups.set("All", anime);

    for (const entry of anime) {
        const type = TYPE_ORDER.includes(entry.type) ? entry.type : "Other";
        const existing = groups.get(type) || [];
        existing.push(entry);
        groups.set(type, existing);
    }

    return groups;
}

function AnimeSection({ anime }: { anime: ProducerAnimeEntry[] }) {
    if (anime.length === 0) {
        return <p className={styles.emptyMessage}>No anime found for this studio.</p>;
    }

    const grouped = groupAnimeByType(anime);

    const tabs: PillTab[] = [{ id: "All", label: "All", count: anime.length }];

    for (const type of TYPE_ORDER) {
        const count = grouped.get(type)?.length || 0;
        if (count > 0) {
            tabs.push({ id: type, label: type, count });
        }
    }

    const renderContent = (tabId: string) => {
        const animeList = grouped.get(tabId) || [];
        return <AnimeGrid anime={animeList} />;
    };

    return (
        <div className={styles.animeSection}>
            <PillTabs tabs={tabs} defaultTab="All" renderContent={renderContent} />
        </div>
    );
}

export function ProducerPageClient({ producer, anime }: ProducerPageClientProps) {
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

            {anime.length > 0 && (
                <ContentTabsWrapper>
                    <AnimeSection anime={anime} />
                </ContentTabsWrapper>
            )}
        </EntityPageLayout>
    );
}
