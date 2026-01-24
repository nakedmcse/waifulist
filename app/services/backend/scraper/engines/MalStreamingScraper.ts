import { StreamingLink } from "@/types/anime";
import { isDeepLink } from "@/lib/utils/urlUtils";
import { ScraperType, StreamingScraperArgs } from "../types";
import { AbstractMalScraperEngine } from "./AbstractMalScraperEngine";

class MalStreamingScraper extends AbstractMalScraperEngine<StreamingLink, StreamingScraperArgs> {
    public override readonly name = "mal";
    public override readonly type = ScraperType.STREAMING;
    public override readonly priority = 10;

    public override isEnabled(): boolean {
        return true;
    }

    protected override getUrlPath({ malId }: StreamingScraperArgs): string {
        return `anime/${malId}`;
    }

    protected override parseDocument(document: Document): StreamingLink[] {
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
