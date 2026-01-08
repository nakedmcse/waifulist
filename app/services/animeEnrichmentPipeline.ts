import { Anime } from "@/types/anime";
import { fetchAnimeFromCdn } from "@/lib/cdn";
import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { scrapeStreaming } from "./scraper";

type EnrichmentCheck = (anime: Anime) => boolean;
type EnrichmentAction = (anime: Anime) => Promise<Anime>;

type EnrichmentStep = {
    name: string;
    needsEnrichment: EnrichmentCheck;
    enrich: EnrichmentAction;
};

/**
 * Enrichment pipeline - each step checks if enrichment is needed and applies it
 */
const ENRICHMENT_STEPS: EnrichmentStep[] = [
    {
        name: "jikan",
        needsEnrichment: needsJikanEnrichment,
        enrich: enrichFromJikan,
    },
    {
        name: "streaming",
        needsEnrichment: needsStreamingEnrichment,
        enrich: enrichStreaming,
    },
];

/**
 * Check if anime needs basic details (synopsis, relations, etc.)
 */
function needsJikanEnrichment(anime: Anime): boolean {
    return !anime.synopsis;
}

/**
 * Check if anime needs streaming data
 * Note: null/undefined = not checked yet, empty array = checked but nothing found
 */
function needsStreamingEnrichment(anime: Anime): boolean {
    return anime.streaming === null || anime.streaming === undefined;
}

/**
 * Enrich anime with full details from Jikan CDN
 */
async function enrichFromJikan(anime: Anime): Promise<Anime> {
    const detailed = await fetchAnimeFromCdn(anime.mal_id);
    return detailed ?? anime;
}

/**
 * Enrich anime with streaming data from scraper engines
 */
async function enrichStreaming(anime: Anime): Promise<Anime> {
    const streaming = await scrapeStreaming(anime.mal_id);
    return { ...anime, streaming };
}

/**
 * Check if anime needs any enrichment
 */
export function needsEnrichment(anime: Anime): boolean {
    return ENRICHMENT_STEPS.some(step => step.needsEnrichment(anime));
}

/**
 * Enrich anime data through the enrichment pipeline and cache result
 */
export async function enrichAnime(anime: Anime): Promise<Anime> {
    let enriched = anime;
    let wasEnriched = false;

    for (const step of ENRICHMENT_STEPS) {
        if (step.needsEnrichment(enriched)) {
            enriched = await step.enrich(enriched);
            wasEnriched = true;
        }
    }

    if (wasEnriched) {
        await cacheEnrichedAnime(enriched);
    }

    return enriched;
}

/**
 * Cache enriched anime to Redis
 */
async function cacheEnrichedAnime(anime: Anime): Promise<void> {
    const redis = getRedis();
    try {
        await redis.setex(REDIS_KEYS.ANIME_BY_ID(anime.mal_id), REDIS_TTL.JIKAN_ENRICHED_ANIME, JSON.stringify(anime));
    } catch {}
}
