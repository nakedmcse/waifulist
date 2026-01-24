import { NextResponse } from "next/server";
import { getAllGenres } from "@/services/backend/animeData";

export async function GET() {
    const genres = await getAllGenres();
    return NextResponse.json({ genres });
}
