"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PersonAnimePosition, PersonFull, PersonVoiceRole } from "@/types/person";
import { formatLongText } from "@/lib/textUtils";
import { Pill } from "@/components/Pill/Pill";
import { RoleTabs } from "@/components/RoleTabs/RoleTabs";
import { Tab, Tabs } from "@/components/Tabs/Tabs";
import styles from "./page.module.scss";

interface PersonPageClientProps {
    person: PersonFull;
}

function formatName(name: string): string {
    const parts = name.split(", ");
    if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`;
    }
    return name;
}

function formatBirthday(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

interface GroupedVoiceRoles {
    anime: PersonVoiceRole["anime"];
    characters: Array<{
        character: PersonVoiceRole["character"];
        role: string;
    }>;
}

function groupVoiceRolesByAnime(voices: PersonVoiceRole[]): GroupedVoiceRoles[] {
    const groups: Map<number, GroupedVoiceRoles> = new Map();

    for (const voice of voices) {
        const animeId = voice.anime.mal_id;
        if (!groups.has(animeId)) {
            groups.set(animeId, {
                anime: voice.anime,
                characters: [],
            });
        }
        groups.get(animeId)!.characters.push({
            character: voice.character,
            role: voice.role,
        });
    }

    return Array.from(groups.values()).sort((a, b) => a.anime.title.localeCompare(b.anime.title));
}

function VoiceRolesContent({ voices }: { voices: PersonVoiceRole[] }) {
    const [visibleCount, setVisibleCount] = useState(25);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 25);
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }
        }, 50);
    };

    const renderRoleGroups = (roleVoices: PersonVoiceRole[]) => {
        const grouped = groupVoiceRolesByAnime(roleVoices);
        const displayGroups = grouped.slice(0, visibleCount);
        const remaining = grouped.length - visibleCount;

        return (
            <div className={styles.voiceRolesWrapper}>
                <div ref={containerRef} className={styles.voiceRolesContainer}>
                    {displayGroups.map(group => {
                        const animeImageUrl =
                            group.anime.images?.jpg?.large_image_url || group.anime.images?.jpg?.image_url;
                        return (
                            <div key={group.anime.mal_id} className={styles.animeGroup}>
                                <Link href={`/anime/${group.anime.mal_id}`} className={styles.animeHeader}>
                                    <div className={styles.animeImage}>
                                        {animeImageUrl ? (
                                            <Image src={animeImageUrl} alt={group.anime.title} fill sizes="60px" />
                                        ) : (
                                            <div className={styles.noImage} />
                                        )}
                                    </div>
                                    <span className={styles.animeTitle}>{group.anime.title}</span>
                                </Link>
                                <div className={styles.characterList}>
                                    {group.characters.map(({ character }) => {
                                        const charImageUrl =
                                            character.images?.webp?.image_url || character.images?.jpg?.image_url;
                                        return (
                                            <Link
                                                key={character.mal_id}
                                                href={`/character/${character.mal_id}`}
                                                className={styles.characterCard}
                                            >
                                                <div className={styles.characterImage}>
                                                    {charImageUrl ? (
                                                        <Image
                                                            src={charImageUrl}
                                                            alt={character.name}
                                                            fill
                                                            sizes="40px"
                                                        />
                                                    ) : (
                                                        <div className={styles.noImage} />
                                                    )}
                                                </div>
                                                <span className={styles.characterName}>
                                                    {formatName(character.name)}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {remaining > 0 && (
                    <button className={styles.showMoreButton} onClick={handleShowMore}>
                        Show {Math.min(remaining, 25)} more
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className={styles.tabContentSection}>
            <RoleTabs
                items={voices}
                getRole={v => v.role as "Main" | "Supporting"}
                renderItems={renderRoleGroups}
                emptyMessage={role => `No ${role.toLowerCase()} roles`}
            />
        </div>
    );
}

function AnimeStaffContent({ anime }: { anime: PersonAnimePosition[] }) {
    const [visibleCount, setVisibleCount] = useState(25);
    const containerRef = useRef<HTMLDivElement>(null);

    const displayAnime = anime.slice(0, visibleCount);
    const remaining = anime.length - visibleCount;

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 25);
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }
        }, 50);
    };

    return (
        <div className={styles.tabContentSection}>
            <div className={styles.staffWrapper}>
                <div ref={containerRef} className={styles.staffContainer}>
                    <div className={styles.staffGrid}>
                        {displayAnime.map((position, index) => {
                            const imageUrl =
                                position.anime.images?.jpg?.large_image_url || position.anime.images?.jpg?.image_url;
                            return (
                                <Link
                                    key={`${position.anime.mal_id}-${index}`}
                                    href={`/anime/${position.anime.mal_id}`}
                                    className={styles.staffCard}
                                >
                                    <div className={styles.staffImage}>
                                        {imageUrl ? (
                                            <Image src={imageUrl} alt={position.anime.title} fill sizes="140px" />
                                        ) : (
                                            <div className={styles.noImage} />
                                        )}
                                    </div>
                                    <span className={styles.staffTitle}>{position.anime.title}</span>
                                    <span className={styles.staffPosition}>{position.position}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                {remaining > 0 && (
                    <button className={styles.showMoreButton} onClick={handleShowMore}>
                        Show {Math.min(remaining, 25)} more
                    </button>
                )}
            </div>
        </div>
    );
}

export function PersonPageClient({ person }: PersonPageClientProps) {
    const imageUrl = person.images?.jpg?.image_url;
    const aboutParagraphs = person.about ? formatLongText(person.about) : [];

    const japaneseName = person.family_name && person.given_name ? `${person.family_name} ${person.given_name}` : null;

    const tabs: Tab[] = [];

    if (person.voices && person.voices.length > 0) {
        tabs.push({
            id: "voice-roles",
            label: `Voice Roles (${person.voices.length})`,
            content: <VoiceRolesContent voices={person.voices} />,
        });
    }

    if (person.anime && person.anime.length > 0) {
        tabs.push({
            id: "anime-staff",
            label: `Anime Staff (${person.anime.length})`,
            content: <AnimeStaffContent anime={person.anime} />,
        });
    }

    return (
        <div className={styles.page}>
            <div className={styles.backdrop}>
                {imageUrl && <Image src={imageUrl} alt="" fill className={styles.backdropImage} />}
                <div className={styles.backdropOverlay} />
            </div>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.imageSection}>
                        <div className={styles.personImage}>
                            {imageUrl ? (
                                <Image src={imageUrl} alt={person.name} fill sizes="280px" />
                            ) : (
                                <div className={styles.noImage} />
                            )}
                        </div>
                        {person.birthday && (
                            <div className={styles.birthday}>
                                <i className="bi bi-cake2-fill" />
                                <span>{formatBirthday(person.birthday)}</span>
                            </div>
                        )}
                        <div className={styles.favorites}>
                            <i className="bi bi-heart-fill" />
                            <span>{person.favorites.toLocaleString()} favorites</span>
                        </div>
                        <div className={styles.externalLinks}>
                            {person.website_url && (
                                <a
                                    href={person.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.externalLink}
                                >
                                    <i className="bi bi-globe" />
                                    Official Website
                                </a>
                            )}
                            <a
                                href={person.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalLink}
                            >
                                <i className="bi bi-box-arrow-up-right" />
                                View on MyAnimeList
                            </a>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.header}>
                            <h1 className={styles.name}>{formatName(person.name)}</h1>
                            {japaneseName && <p className={styles.japaneseName}>{japaneseName}</p>}
                        </div>

                        {person.alternate_names && person.alternate_names.length > 0 && (
                            <div className={styles.alternateNames}>
                                {person.alternate_names.map((name, i) => (
                                    <Pill key={i}>{name}</Pill>
                                ))}
                            </div>
                        )}

                        {aboutParagraphs.length > 0 && (
                            <div className={styles.about}>
                                {aboutParagraphs.map((paragraph, i) => (
                                    <p key={i} className={paragraph.isAttribution ? styles.attribution : undefined}>
                                        {paragraph.text}
                                    </p>
                                ))}
                            </div>
                        )}

                        {tabs.length > 0 && (
                            <div className={styles.contentTabs}>
                                <Tabs tabs={tabs} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
