import { NextRequest, NextResponse } from "next/server";
import { fetchCharacterById } from "@/lib/jikanApi";
import { getVSBattlesStats } from "@/services/backend/vsbattlesService";

interface RouteParams {
    params: Promise<{ characterId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { characterId } = await params;
    const id = parseInt(characterId, 10);

    if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid character ID" }, { status: 400 });
    }

    const character = await fetchCharacterById(id);
    if (!character) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const animeTitles = character.anime.map(a => a.anime.title);
    const mangaTitles = character.manga.map(m => m.manga.title);
    const allTitles = [...animeTitles, ...mangaTitles];

    const formattedName = formatCharacterName(character.name);

    const stats = await getVSBattlesStats(formattedName, allTitles);

    if (!stats) {
        return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, stats });
}

function formatCharacterName(name: string): string {
    const parts = name.split(", ");
    if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`;
    }
    return name;
}
