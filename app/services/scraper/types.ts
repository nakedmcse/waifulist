/**
 * Valid scraper types
 */
export enum ScraperType {
    STREAMING = "streaming",
}

/**
 * Generic result from a scraper engine
 */
export interface ScraperResult<T> {
    source: string;
    data: T[];
    error?: string;
}

/**
 * Generic interface for scraper engines
 */
export interface ScraperEngine<T> {
    /** Unique identifier for this engine */
    readonly name: string;

    /** Type of scraper (e.g., "streaming", "staff") */
    readonly type: ScraperType;

    /** Priority for merging results (lower = higher priority) */
    readonly priority: number;

    /** Whether this engine is enabled */
    isEnabled(): boolean;

    /** Scrape data for an anime */
    scrape(malId: number): Promise<ScraperResult<T>>;
}

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
    /** Maximum requests per window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}
