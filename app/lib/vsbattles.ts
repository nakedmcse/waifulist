import { cache } from "react";
import { WikiPage, WikiRevisionResponse, WikiSearchResponse, WikiSearchResult } from "@/types/vsbattles";

const VSBATTLES_API = "https://vsbattles.fandom.com/api.php";
const VSBATTLES_TIMEOUT = 10000;

async function fetchWithTimeout<T>(url: string): Promise<T | null> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), VSBATTLES_TIMEOUT);

        const res = await fetch(url, {
            signal: controller.signal,
            next: { revalidate: 3600 },
        });

        clearTimeout(timeout);

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch {
        return null;
    }
}

export const searchVSBattles = cache(async (query: string): Promise<WikiSearchResult[]> => {
    const encoded = encodeURIComponent(query);
    const url = `${VSBATTLES_API}?action=query&list=search&srsearch=${encoded}&srlimit=10&format=json`;

    const data = await fetchWithTimeout<WikiSearchResponse>(url);
    return data?.query?.search || [];
});

export const fetchWikiPage = cache(async (pageTitle: string): Promise<WikiPage | null> => {
    const encoded = encodeURIComponent(pageTitle.replace(/ /g, "_"));
    const url = `${VSBATTLES_API}?action=query&titles=${encoded}&prop=revisions&rvprop=content&rvslots=main&format=json`;

    const data = await fetchWithTimeout<WikiRevisionResponse>(url);
    const pages = data?.query?.pages;
    if (!pages) {
        return null;
    }

    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") {
        return null;
    }

    const page = pages[pageId];
    const wikitext = page.revisions?.[0]?.slots?.main?.["*"];
    if (!wikitext) {
        return null;
    }

    return {
        pageid: page.pageid,
        title: page.title,
        wikitext,
    };
});
