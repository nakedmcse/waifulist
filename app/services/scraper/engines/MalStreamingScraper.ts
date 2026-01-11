import { JSDOM } from "jsdom";
import { StreamingLink } from "@/types/anime";
import { isDeepLink } from "@/lib/utils/urlUtils";
import { ScraperEngine, ScraperResult, ScraperType, StreamingScraperArgs } from "../types";

const SCRAPE_TIMEOUT = 10000;

class MalStreamingScraper implements ScraperEngine<StreamingLink, StreamingScraperArgs> {
    public readonly name = "mal";
    public readonly type = ScraperType.STREAMING;
    public readonly priority = 10;

    public isEnabled(): boolean {
        return true;
    }

    public async scrape({ malId }: StreamingScraperArgs): Promise<ScraperResult<StreamingLink>> {
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

            if (href && name && isDeepLink(href)) {
                links.push({ name, url: href });
            }
        }

        return links;
    }
}

export const malStreamingScraper = new MalStreamingScraper();
