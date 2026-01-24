import { AnimeType, ProducerAnimeEntry, ProducerScraperArgs, ScraperType } from "../types";
import { AbstractMalScraperEngine } from "./AbstractMalScraperEngine";

class MalProducerScraper extends AbstractMalScraperEngine<ProducerAnimeEntry, ProducerScraperArgs> {
    private readonly TYPE_MAP: Record<string, AnimeType> = {
        "1": "TV",
        "2": "OVA",
        "3": "Movie",
        "4": "Special",
        "5": "ONA",
        "6": "Music",
    };

    public override readonly name = "mal";
    public override readonly type = ScraperType.PRODUCER;
    public override readonly priority = 10;

    public override isEnabled(): boolean {
        return true;
    }

    protected override getUrlPath({ producerId }: ProducerScraperArgs): string {
        return `anime/producer/${producerId}`;
    }

    protected override parseDocument(document: Document): ProducerAnimeEntry[] {
        const entries: ProducerAnimeEntry[] = [];
        const animeCards = document.querySelectorAll(".js-anime-category-producer, .js-anime-category-studio");

        for (const card of animeCards) {
            const linkElement = card.querySelector(".image a, .title a");
            if (!linkElement) {
                continue;
            }

            const href = linkElement.getAttribute("href");
            if (!href) {
                continue;
            }

            const malIdMatch = href.match(/\/anime\/(\d+)/);
            if (!malIdMatch) {
                continue;
            }

            const malId = parseInt(malIdMatch[1], 10);

            const categoryElement = card.querySelector(".category");
            const role = categoryElement?.textContent?.trim() || "Studio";

            const classList = card.className || "";
            const typeMatch = classList.match(/js-anime-type-(\d+)/);
            const typeCode = typeMatch ? typeMatch[1] : null;
            const type: AnimeType = typeCode && this.TYPE_MAP[typeCode] ? this.TYPE_MAP[typeCode] : "Other";

            entries.push({ mal_id: malId, type, role });
        }
        return entries;
    }
}

export const malProducerScraper = new MalProducerScraper();
