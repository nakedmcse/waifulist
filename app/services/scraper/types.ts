export enum ScraperType {
    STREAMING = "streaming",
}

export interface ScraperResult<T> {
    source: string;
    data: T[];
    error?: string;
}

export interface ScraperEngine<T, Args = void> {
    readonly name: string;
    readonly type: ScraperType;
    readonly priority: number;
    isEnabled(): boolean;
    scrape(args: Args): Promise<ScraperResult<T>>;
}

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface StreamingScraperArgs {
    malId: number;
}
