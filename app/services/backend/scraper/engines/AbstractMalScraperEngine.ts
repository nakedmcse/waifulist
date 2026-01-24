import { JSDOM } from "jsdom";
import { ScraperEngine, ScraperResult, ScraperType } from "../types";

export abstract class AbstractMalScraperEngine<T, Args> implements ScraperEngine<T, Args> {
    private readonly SCRAPE_TIMEOUT = 15000;
    private readonly USER_AGENT = "Mozilla/5.0 (compatible; Waifulist/1.0)";

    public abstract readonly name: string;
    public abstract readonly type: ScraperType;
    public abstract readonly priority: number;

    public async scrape(args: Args): Promise<ScraperResult<T>> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.SCRAPE_TIMEOUT);

            const response = await fetch(`https://myanimelist.net/${this.getUrlPath(args)}`, {
                signal: controller.signal,
                headers: {
                    "User-Agent": this.USER_AGENT,
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
            const dom = new JSDOM(html);
            const data = this.parseDocument(dom.window.document);

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

    protected abstract getUrlPath(args: Args): string;
    protected abstract parseDocument(document: Document): T[];

    public abstract isEnabled(): boolean;
}
