import { JSDOM } from "jsdom";
import { StreamingLink } from "@/types/anime";
import { ScraperEngine, ScraperResult, ScraperType } from "../types";

const SCRAPE_TIMEOUT = 10000;

/**
 * Scrapes streaming links from MyAnimeList pages
 */
class MalStreamingScraper implements ScraperEngine<StreamingLink> {
    public readonly name = "mal";
    public readonly type = ScraperType.STREAMING;
    public readonly priority = 10;

    public isEnabled(): boolean {
        return true;
    }

    public async scrape(malId: number): Promise<ScraperResult<StreamingLink>> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);

            const response = await fetch(`https://myanimelist.net/anime/${malId}`, {
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
            const data = this.parseStreamingLinks(html);

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

    private parseStreamingLinks(html: string): StreamingLink[] {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const links: StreamingLink[] = [];
        const streamingLinks = document.querySelectorAll(".broadcast-item");

        for (const link of streamingLinks) {
            const href = link.getAttribute("href");
            const name = link.getAttribute("title");

            if (href && name && this.isDeepLink(href)) {
                links.push({ name, url: href });
            }
        }

        return links;
    }

    private isDeepLink(url: string): boolean {
        try {
            const parsed = new URL(url);
            return parsed.pathname.length > 1 || parsed.search.length > 0;
        } catch {
            return false;
        }
    }
}

export const malStreamingScraper = new MalStreamingScraper();
