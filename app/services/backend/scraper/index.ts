import { cache } from "react";
import { StreamingLink } from "@/types/anime";
import { scraperManager } from "./manager";
import { ProducerAnimeEntry, ProducerScraperArgs, ScraperType, StreamingScraperArgs } from "./types";

export const scrapeStreaming = cache((malId: number) => {
    return scraperManager.scrape<StreamingLink, StreamingScraperArgs>(ScraperType.STREAMING, { malId });
});

export const scrapeProducerAnime = cache((producerId: number) => {
    return scraperManager.scrape<ProducerAnimeEntry, ProducerScraperArgs>(ScraperType.PRODUCER, { producerId });
});

export type { ScraperEngine, ScraperResult, RateLimitConfig, ProducerAnimeEntry, AnimeType } from "./types";
