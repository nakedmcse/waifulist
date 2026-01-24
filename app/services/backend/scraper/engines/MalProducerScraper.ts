import { JSDOM } from "jsdom";
import {
    AnimeType,
    ProducerAnimeEntry,
    ProducerScraperArgs,
    ScraperEngine,
    ScraperResult,
    ScraperType,
} from "../types";

const SCRAPE_TIMEOUT = 15000;

const TYPE_MAP: Record<string, AnimeType> = {
    "1": "TV",
    "2": "OVA",
    "3": "Movie",
    "4": "Special",
    "5": "ONA",
    "6": "Music",
};

class MalProducerScraper implements ScraperEngine<ProducerAnimeEntry, ProducerScraperArgs> {
    public readonly name = "mal";
    public readonly type = ScraperType.PRODUCER;
    public readonly priority = 10;

    public isEnabled(): boolean {
        return true;
    }

    public async scrape({ producerId }: ProducerScraperArgs): Promise<ScraperResult<ProducerAnimeEntry>> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);

            const response = await fetch(`https://myanimelist.net/anime/producer/${producerId}`, {
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
            const data = this.parseProducerAnime(html);

            return {
                source: this.name,
                data,
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

    private parseProducerAnime(html: string): ProducerAnimeEntry[] {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const entries: ProducerAnimeEntry[] = [];
        const animeCards = document.querySelectorAll(".js-anime-category-producer, .js-anime-category-studio");
        for (const card of animeCards) {
            const linkElement = card.querySelector(".image a, .title a");
            if (!linkElement) {
                continue;
            }

            const href = linkElement.getAttribute("href");
            if (!href) {
                continue;
            }

            const malIdMatch = href.match(/\/anime\/(\d+)/);
            if (!malIdMatch) {
                continue;
            }

            const malId = parseInt(malIdMatch[1], 10);

            const titleElement = card.querySelector(".js-title") || card.querySelector(".title a");
            const title = titleElement?.textContent?.trim() || "";

            const imgElement = card.querySelector("img");
            const imageUrl = imgElement?.getAttribute("data-src") || imgElement?.getAttribute("src") || null;

            const scoreElement = card.querySelector(".js-score") || card.querySelector(".stars");
            const scoreText = scoreElement?.textContent?.trim();
            const score = scoreText ? parseFloat(scoreText) : null;

            const membersElement = card.querySelector(".js-members") || card.querySelector(".users");
            const membersText = membersElement?.textContent?.trim().replace(/,/g, "");
            const members = membersText ? parseInt(membersText, 10) : null;

            const startDateElement = card.querySelector(".js-start_date");
            const startDate = startDateElement?.textContent?.trim() || null;

            const categoryElement = card.querySelector(".category");
            const role = categoryElement?.textContent?.trim() || "Studio";

            const classList = card.className || "";
            const typeMatch = classList.match(/js-anime-type-(\d+)/);
            const typeCode = typeMatch ? typeMatch[1] : null;
            const type: AnimeType = typeCode && TYPE_MAP[typeCode] ? TYPE_MAP[typeCode] : "Other";

            if (malId && title) {
                entries.push({
                    mal_id: malId,
                    title,
                    image_url: imageUrl,
                    score: isNaN(score as number) ? null : score,
                    members: isNaN(members as number) ? null : members,
                    start_date: startDate,
                    role,
                    type,
                });
            }
        }

        return entries;
    }
}

export const malProducerScraper = new MalProducerScraper();
