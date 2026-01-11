export interface WikiSearchResult {
    ns: number;
    title: string;
    pageid: number;
}

export interface WikiSearchResponse {
    query?: {
        search: WikiSearchResult[];
    };
}

export interface WikiRevisionResponse {
    query?: {
        pages: Record<
            string,
            {
                pageid: number;
                title: string;
                revisions?: Array<{
                    slots?: {
                        main?: {
                            "*": string;
                        };
                    };
                }>;
            }
        >;
    };
}

export interface WikiPage {
    pageid: number;
    title: string;
    wikitext: string;
}

export interface PowerEntry {
    name: string;
    description?: string;
}

export interface VSBattlesStats {
    pageId: number;
    pageTitle: string;
    pageUrl: string;
    name?: string;
    origin?: string;
    classification?: string;
    gender?: string;
    age?: string;
    tier?: string;
    attackPotency?: string;
    speed?: string;
    durability?: string;
    strikingStrength?: string;
    liftingStrength?: string;
    stamina?: string;
    range?: string;
    intelligence?: string;
    standardEquipment?: string;
    powers?: PowerEntry[];
    weaknesses?: string;
    keys?: string[];
    notableAttacks?: string;
}
