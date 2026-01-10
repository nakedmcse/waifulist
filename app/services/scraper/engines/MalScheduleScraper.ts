import { JSDOM } from "jsdom";
import { ScheduleScraperArgs, ScraperEngine, ScraperResult, ScraperType } from "../types";
import { DayOfWeek, DAYS_OF_WEEK, ScheduleAnime, ScheduleByDay } from "@/types/schedule";

const SCRAPE_TIMEOUT = 15000;

class MalScheduleScraper implements ScraperEngine<ScheduleByDay, ScheduleScraperArgs> {
    public readonly name = "mal-schedule";
    public readonly type = ScraperType.SCHEDULE;
    public readonly priority = 10;

    private readonly dayMapping: Record<string, DayOfWeek> = {
        monday: "monday",
        tuesday: "tuesday",
        wednesday: "wednesday",
        thursday: "thursday",
        friday: "friday",
        saturday: "saturday",
        sunday: "sunday",
        other: "other",
        unknown: "unknown",
    };

    public isEnabled(): boolean {
        return true;
    }

    public async scrape(): Promise<ScraperResult<ScheduleByDay>> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);

            const response = await fetch("https://myanimelist.net/anime/season/schedule", {
                signal: controller.signal,
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; Waifulist/1.0)",
                    Accept: "text/html",
                },
            });
            clearTimeout(timeout);

            if (!response.ok) {
                return {
                    source: this.name,
                    data: [],
                    error: `HTTP ${response.status}`,
                };
            }

            const html = await response.text();
            const data = this.parseScheduleHtml(html);

            return {
                source: this.name,
                data: [data],
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                source: this.name,
                data: [],
                error: message,
            };
        }
    }

    private createEmptySchedule(): ScheduleByDay {
        const schedule: ScheduleByDay = {} as ScheduleByDay;
        for (const day of DAYS_OF_WEEK) {
            schedule[day] = [];
        }
        return schedule;
    }

    private parseScheduleHtml(html: string): ScheduleByDay {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const schedule = this.createEmptySchedule();

        for (const [dayKey, day] of Object.entries(this.dayMapping)) {
            const dayContainers = document.querySelectorAll(
                `.js-seasonal-anime-list-key-${dayKey}, [data-day="${dayKey}"], .seasonal-anime-list[data-filter="${dayKey}"]`,
            );

            for (const container of dayContainers) {
                const animeCards = container.querySelectorAll(".seasonal-anime, .js-anime-watch-info");
                for (const card of animeCards) {
                    const anime = this.parseAnimeCard(card);
                    if (anime) {
                        schedule[day].push(anime);
                    }
                }
            }

            if (schedule[day].length === 0) {
                const headerSelectors = [
                    `h2:contains("${dayKey}")`,
                    `.anime-header:contains("${dayKey}")`,
                    `[id*="${dayKey}"]`,
                ];

                for (const selector of headerSelectors) {
                    try {
                        const header = document.querySelector(selector);
                        if (header) {
                            let sibling = header.nextElementSibling;
                            while (sibling && !sibling.matches("h2, .anime-header")) {
                                const cards = sibling.querySelectorAll(".seasonal-anime, .js-anime-watch-info");
                                for (const card of cards) {
                                    const anime = this.parseAnimeCard(card);
                                    if (anime) {
                                        schedule[day].push(anime);
                                    }
                                }
                                sibling = sibling.nextElementSibling;
                            }
                        }
                    } catch {}
                }
            }
        }

        return schedule;
    }

    private parseAnimeCard(card: Element): ScheduleAnime | null {
        const titleLink = card.querySelector(".title a, h2.h2_anime_title a, .link-title, a.link-title");
        if (!titleLink) {
            return null;
        }

        const href = titleLink.getAttribute("href") || "";
        const malIdMatch = href.match(/\/anime\/(\d+)/);
        if (!malIdMatch) {
            return null;
        }

        const mal_id = parseInt(malIdMatch[1], 10);
        const title = titleLink.textContent?.trim() || "";

        const imageEl = card.querySelector(".image img, .lazyload, img.lazyloaded");
        const imageUrl =
            imageEl?.getAttribute("data-src") ||
            imageEl?.getAttribute("data-srcset")?.split(" ")[0] ||
            imageEl?.getAttribute("src") ||
            "";

        const scoreEl = card.querySelector(".score, .scormem-container .score, .information .score");
        const scoreText = scoreEl?.textContent?.trim().replace("N/A", "") || "";
        const score = parseFloat(scoreText) || undefined;

        const genreEls = card.querySelectorAll(".genre a, .genres-inner a");
        const genres: { mal_id: number; name: string }[] = [];
        for (const el of genreEls) {
            const genreHref = el.getAttribute("href") || "";
            const genreIdMatch = genreHref.match(/\/(\d+)\//);
            genres.push({
                mal_id: genreIdMatch ? parseInt(genreIdMatch[1], 10) : 0,
                name: el.textContent?.trim() || "",
            });
        }

        const studioEl = card.querySelector(".producer a, .property a, .studios a");
        const studios: { mal_id: number; name: string }[] = [];
        if (studioEl) {
            const studioHref = studioEl.getAttribute("href") || "";
            const studioIdMatch = studioHref.match(/\/(\d+)\//);
            studios.push({
                mal_id: studioIdMatch ? parseInt(studioIdMatch[1], 10) : 0,
                name: studioEl.textContent?.trim() || "",
            });
        }

        const synopsisEl = card.querySelector(".synopsis .preline, .synopsis p, .synopsis");
        const synopsis = synopsisEl?.textContent?.trim().replace(/\s+/g, " ") || undefined;

        const episodesEl = card.querySelector(".info .item, .prodsrc .eps");
        let episodes: number | undefined;
        if (episodesEl) {
            const epsMatch = episodesEl.textContent?.match(/(\d+)\s*eps?/i);
            if (epsMatch) {
                episodes = parseInt(epsMatch[1], 10);
            }
        }

        const sourceEl = card.querySelector(".info .source, .prodsrc .source");
        const source = sourceEl?.textContent?.trim() || undefined;

        return {
            mal_id,
            title,
            images: imageUrl
                ? {
                      jpg: {
                          image_url: imageUrl,
                          small_image_url: imageUrl,
                          large_image_url: imageUrl,
                      },
                  }
                : undefined,
            score,
            episodes,
            source,
            genres,
            studios,
            synopsis,
            type: "TV",
            status: "Currently Airing",
        };
    }
}

export const malScheduleScraper = new MalScheduleScraper();
