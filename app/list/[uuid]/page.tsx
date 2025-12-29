import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllWatched, getUserByPublicId } from "@/lib/db";
import { PublicListClient } from "./PublicListClient";

interface PageProps {
    params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { uuid } = await params;

    const user = getUserByPublicId(uuid);

    if (!user) {
        return {
            title: "List Not Found | WaifuList",
            description: "The list you're looking for doesn't exist or has been removed.",
        };
    }

    const items = getAllWatched(user.id);
    const title = `${user.username}'s Anime List | WaifuList`;
    const description = `Check out ${user.username}'s anime collection with ${items.length} titles on WaifuList.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: "WaifuList",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function PublicListPage({ params }: PageProps) {
    const { uuid } = await params;

    const user = getUserByPublicId(uuid);

    if (!user) {
        notFound();
    }

    return <PublicListClient uuid={uuid} initialUsername={user.username} />;
}
