import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnimeById } from "@/services/animeData";
import { AnimePageClient } from "./AnimePageClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const animeId = parseInt(id, 10);

    if (isNaN(animeId)) {
        return {
            title: "Invalid Anime | WaifuList",
        };
    }

    const anime = await getAnimeById(animeId, true);

    if (!anime) {
        return {
            title: "Anime Not Found | WaifuList",
            description: "The anime you're looking for doesn't exist.",
        };
    }

    const description = anime.synopsis
        ? anime.synopsis.split(" ").slice(0, 20).join(" ") + "..."
        : `Track ${anime.title} on WaifuList`;

    const imageUrl = anime.main_picture?.large || anime.main_picture?.medium;

    return {
        title: `${anime.title} | WaifuList`,
        description,
        openGraph: {
            title: `${anime.title} | WaifuList`,
            description,
            siteName: "WaifuList",
            images: imageUrl ? [{ url: imageUrl }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `${anime.title} | WaifuList`,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
    };
}

export default async function AnimePage({ params }: PageProps) {
    const { id } = await params;
    const animeId = parseInt(id, 10);

    if (isNaN(animeId)) {
        notFound();
    }

    const anime = await getAnimeById(animeId, true);

    if (!anime) {
        notFound();
    }

    return <AnimePageClient anime={anime} />;
}
