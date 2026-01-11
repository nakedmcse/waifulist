import { getRedis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { fetchWikiPage, searchVSBattles } from "@/lib/vsbattles";
import { PowerEntry, VSBattlesStats } from "@/types/vsbattles";

export type { PowerEntry, VSBattlesStats } from "@/types/vsbattles";

const EXCLUDED_POWER_NAMES = new Set([
    "Attack Potency",
    "Speed",
    "Durability",
    "Striking Strength",
    "Lifting Strength",
    "Stamina",
    "Range",
    "Intelligence",
    "Standard Equipment",
    "Weaknesses",
    "Notable Attacks/Techniques",
    "Key",
]);

function cleanWikitext(text: string): string {
    return text
        .replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, "$1")
        .replace(/\[https?:\/\/[^\]]+\]/g, "")
        .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1")
        .replace(/'''?/g, "")
        .replace(/{{(?:Quote|Nihongo|Border|tabber)[^}]*}}/gi, "")
        .replace(/{{([^|}]+)}}/g, "$1")
        .replace(/{{[^}]+}}/g, "")
        .replace(/<tabber>[\s\S]*?<\/tabber>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function extractField(wikitext: string, fieldName: string): string | undefined {
    const patterns = [
        new RegExp(`'''\\[\\[${fieldName}(?:\\|[^\\]]+)?\\]\\]:'''\\s*([^\\n]+)`, "i"),
        new RegExp(`'''${fieldName}:'''\\s*([^\\n]+)`, "i"),
        new RegExp(`\\|\\s*${fieldName.toLowerCase().replace(/ /g, "_")}\\s*=\\s*([^\\n|]+)`, "i"),
    ];

    for (const pattern of patterns) {
        const match = wikitext.match(pattern);
        if (match) {
            return cleanWikitext(match[1]);
        }
    }
    return undefined;
}

function extractTier(wikitext: string): string | undefined {
    const patterns = [
        /'''?\[\[Tiering System\|Tier\]\]:?'''?\s*([^\n]+)/i,
        /'''?Tier:?'''?\s*([^\n]+)/i,
        /\|\s*tier\s*=\s*([^\n|]+)/i,
    ];

    for (const pattern of patterns) {
        const match = wikitext.match(pattern);
        if (match) {
            return cleanWikitext(match[1]);
        }
    }
    return undefined;
}

function extractKeys(wikitext: string): string[] | undefined {
    const keyMatch = wikitext.match(/'''Key:'''\s*([^\n]+)/i);
    if (keyMatch) {
        const keysText = cleanWikitext(keyMatch[1]);
        const keys = keysText
            .split("|")
            .map(k => k.trim())
            .filter(k => k.length > 0);
        if (keys.length > 0) {
            return keys;
        }
    }
    return undefined;
}

function isValidPowerName(name: string): boolean {
    if (!name || name.length < 2) {
        return false;
    }
    if (name.startsWith("File:") || name.startsWith(":File:")) {
        return false;
    }
    if (name.includes("#")) {
        return false;
    }
    if (name.startsWith("Category:")) {
        return false;
    }
    if (name.startsWith("User blog:")) {
        return false;
    }
    if (name.startsWith("User:")) {
        return false;
    }
    if (name.startsWith("Thread:")) {
        return false;
    }
    if (name.startsWith("Talk:")) {
        return false;
    }
    if (EXCLUDED_POWER_NAMES.has(name)) {
        return false;
    }
    return !/^\d+px$/.test(name);
}

function extractPowers(wikitext: string): PowerEntry[] | undefined {
    const powersMatch = wikitext.match(
        /'''Powers and Abilities:?'''[^*]*(\*[\s\S]+?)(?=<\/tabber>|\n'''\[\[|\n'''[A-Z]|\n==|$)/is,
    );
    if (!powersMatch) {
        return undefined;
    }

    const powersSection = powersMatch[1];
    const lines = powersSection.split(/\n\*+/).filter(l => l.trim());

    const powers: PowerEntry[] = [];
    const seenNames = new Set<string>();

    for (const line of lines) {
        const powerNamesMatch = line.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
        if (!powerNamesMatch) {
            continue;
        }

        const descMatch = line.match(/\(([^()]+(?:\([^()]*\)[^()]*)*)\)\s*$/);
        const description = descMatch ? cleanWikitext(descMatch[1]) : undefined;

        for (const nameMatch of powerNamesMatch) {
            const extracted = nameMatch.match(/\[\[([^\]|]+)/);
            if (extracted) {
                const name = extracted[1].trim();
                if (isValidPowerName(name) && !seenNames.has(name) && powers.length < 50) {
                    seenNames.add(name);
                    powers.push({ name, description });
                }
            }
        }
    }

    return powers.length > 0 ? powers : undefined;
}

function extractNotableAttacks(wikitext: string): string | undefined {
    const match = wikitext.match(/'''Notable Attacks\/Techniques:?'''[:\s]*\n([\s\S]+?)(?=\n==|\n\{\{|$)/i);
    if (match) {
        const section = match[1].replace(/\[\[File:[^\]]+\]\]/g, "").replace(/<gallery[^>]*>[\s\S]*?<\/gallery>/gi, "");
        return cleanWikitext(section).substring(0, 2000);
    }
    return undefined;
}

function parseWikitext(wikitext: string, pageId: number, pageTitle: string): VSBattlesStats {
    return {
        pageId,
        pageTitle,
        pageUrl: `https://vsbattles.fandom.com/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`,
        name: extractField(wikitext, "Name"),
        origin: extractField(wikitext, "Origin"),
        classification: extractField(wikitext, "Classification"),
        gender: extractField(wikitext, "Gender"),
        age: extractField(wikitext, "Age"),
        tier: extractTier(wikitext),
        attackPotency: extractField(wikitext, "Attack Potency"),
        speed: extractField(wikitext, "Speed"),
        durability: extractField(wikitext, "Durability"),
        strikingStrength: extractField(wikitext, "Striking Strength"),
        liftingStrength: extractField(wikitext, "Lifting Strength"),
        stamina: extractField(wikitext, "Stamina"),
        range: extractField(wikitext, "Range"),
        intelligence: extractField(wikitext, "Intelligence"),
        standardEquipment: extractField(wikitext, "Standard Equipment"),
        powers: extractPowers(wikitext),
        weaknesses: extractField(wikitext, "Weaknesses"),
        keys: extractKeys(wikitext),
        notableAttacks: extractNotableAttacks(wikitext),
    };
}

function isCharacterPage(stats: VSBattlesStats): boolean {
    return !!(stats.tier || stats.attackPotency || stats.powers);
}

export async function getVSBattlesStats(
    characterName: string,
    animeTitles: string[] = [],
): Promise<VSBattlesStats | null> {
    const cacheKey = REDIS_KEYS.VSBATTLES(characterName);

    try {
        const redis = getRedis();
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed === "not_found") {
                return null;
            }
            return parsed as VSBattlesStats;
        }
    } catch {}

    const searchResults = await searchVSBattles(characterName);
    if (searchResults.length === 0) {
        await cacheResult(cacheKey, "not_found");
        return null;
    }

    for (const result of searchResults) {
        const titleLower = result.title.toLowerCase();
        const nameLower = characterName.toLowerCase();

        const isExactMatch = titleLower === nameLower;
        const nameInTitle = titleLower.includes(nameLower) || nameLower.includes(titleLower.split("(")[0].trim());
        const seriesMatch = animeTitles.some(
            anime => titleLower.includes(anime.toLowerCase()) || anime.toLowerCase().includes(titleLower),
        );

        if (!isExactMatch && !nameInTitle && !seriesMatch) {
            continue;
        }

        const page = await fetchWikiPage(result.title);
        if (!page) {
            continue;
        }

        const stats = parseWikitext(page.wikitext, page.pageid, page.title);

        if (isCharacterPage(stats)) {
            await cacheResult(cacheKey, JSON.stringify(stats));
            return stats;
        }
    }

    await cacheResult(cacheKey, "not_found");
    return null;
}

async function cacheResult(key: string, value: string): Promise<void> {
    try {
        const redis = getRedis();
        await redis.setex(key, REDIS_TTL.VSBATTLES, value);
    } catch {}
}
