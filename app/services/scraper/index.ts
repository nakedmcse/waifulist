import { cache } from "react";
import { StreamingLink } from "@/types/anime";
import { scraperManager } from "./manager";
import { ScraperType } from "./types";

export const scrapeStreaming = cache((malId: number) => {
    return scraperManager.scrape<StreamingLink>(ScraperType.STREAMING, malId);
});

export type { ScraperEngine, ScraperResult, RateLimitConfig } from "./types";
