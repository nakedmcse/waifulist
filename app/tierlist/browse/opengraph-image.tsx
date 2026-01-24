import { getPublicTierLists } from "@/lib/db/dao/tierList";
import { getCharactersForTierList } from "@/services/backend/anilistData";
import { REDIS_KEYS } from "@/lib/redis";
import { getPreviewCharacterIds, parseTierListData } from "@/services/backend/tierListService";
import { generateOGImage, OG_SIZE, OG_THEMES } from "@/services/backend/opengraphService";

export const dynamic = "force-dynamic";
export const size = OG_SIZE;

export default async function OGImage() {
    const { rows } = getPublicTierLists({ limit: 10, offset: 0, sort: "newest" });

    const allPreviewIds: number[] = [];
    for (const row of rows) {
        const data = parseTierListData(row.data);
        const previewIds = getPreviewCharacterIds(data, 2);
        for (const id of previewIds) {
            if (!allPreviewIds.includes(id)) {
                allPreviewIds.push(id);
            }
            if (allPreviewIds.length >= 5) {
                break;
            }
        }
        if (allPreviewIds.length >= 5) {
            break;
        }
    }

    const characters = await getCharactersForTierList(allPreviewIds);
    const images: string[] = [];
    for (const char of characters) {
        if (char.image) {
            images.push(char.image);
        }
    }

    const cacheKey = REDIS_KEYS.OG_IMAGE("tierlist-browse", "static");

    return generateOGImage({
        id: "tierlist-browse",
        images,
        theme: OG_THEMES.purple,
        label: "WaifuList",
        title: "Browse Tier Lists",
        stats: "Discover community rankings and create your own",
        cacheKey,
    });
}
