import { RateLimitConfig, ScraperResult, ScraperType } from "./types";
import { scraperEngineFactory } from "./factory";

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 30,
    windowMs: 60000,
};

class ScraperManager {
    private static instance: ScraperManager | null = null;

    private readonly rateLimitConfig: RateLimitConfig;
    private requestTimestamps: number[] = [];

    private constructor(rateLimitConfig: RateLimitConfig = DEFAULT_RATE_LIMIT) {
        this.rateLimitConfig = rateLimitConfig;
    }

    public static getInstance(): ScraperManager {
        return (ScraperManager.instance ??= new ScraperManager());
    }

    public async scrape<T, Args>(type: ScraperType, args: Args): Promise<T[]> {
        if (!this.canMakeRequest()) {
            console.warn(`[ScraperManager] Rate limit exceeded, skipping scrape`);
            return [];
        }

        this.recordRequest();

        const engines = scraperEngineFactory.getEngines<T, Args>(type);
        if (engines.length === 0) {
            return [];
        }

        const results = await Promise.all(engines.map(engine => engine.scrape(args)));

        for (const result of results) {
            if (result.error) {
                console.warn(`[ScraperManager] ${result.source} error: ${result.error}`);
            }
        }

        return this.accumulateResults(results);
    }

    private canMakeRequest(): boolean {
        const now = Date.now();
        const windowStart = now - this.rateLimitConfig.windowMs;
        this.requestTimestamps = this.requestTimestamps.filter(ts => ts > windowStart);
        return this.requestTimestamps.length < this.rateLimitConfig.maxRequests;
    }

    private recordRequest(): void {
        this.requestTimestamps.push(Date.now());
    }

    private accumulateResults<T>(results: ScraperResult<T>[]): T[] {
        const seen = new Set<string>();
        const accumulated: T[] = [];

        for (const result of results) {
            for (const item of result.data) {
                const key = JSON.stringify(item);
                if (!seen.has(key)) {
                    seen.add(key);
                    accumulated.push(item);
                }
            }
        }

        return accumulated;
    }
}

export const scraperManager = ScraperManager.getInstance();
