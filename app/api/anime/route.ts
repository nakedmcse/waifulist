import { NextRequest, NextResponse } from "next/server";
import { browseAnime, BrowseSortType, getHomePageAnime, searchAnime } from "@/services/backend/animeData";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const home = searchParams.get("home");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const sort = (searchParams.get("sort") as BrowseSortType) || "rating";
    const hideSpecials = searchParams.get("hideSpecials") === "true";
    const genresParam = searchParams.get("genres");
    const genres = genresParam ? genresParam.split(",").filter(g => g.trim()) : [];

    if (query) {
        const results = await searchAnime(query, limit, hideSpecials, genres);
        return NextResponse.json(results);
    }

    if (home === "true") {
        const data = await getHomePageAnime();
        return NextResponse.json(data);
    }

    const result = await browseAnime(limit, offset, sort, hideSpecials, genres);
    return NextResponse.json(result);
}
