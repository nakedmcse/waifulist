import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducerById } from "@/lib/jikanApi";
import { getProducerAnime } from "@/services/backend/producerService";
import { ProducerPageClient } from "./ProducerPageClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const producerId = parseInt(id, 10);

    if (isNaN(producerId)) {
        return { title: "Invalid Producer | WaifuList" };
    }

    const producer = await fetchProducerById(producerId);

    if (!producer) {
        return { title: "Producer Not Found | WaifuList" };
    }

    const defaultTitle = producer.titles.find(t => t.type === "Default")?.title || "Unknown Producer";
    const title = `${defaultTitle} | WaifuList`;
    const description = producer.about
        ? producer.about.slice(0, 160).replace(/\n/g, " ") + "..."
        : `View ${defaultTitle} studio information on WaifuList`;
    const imageUrl = producer.images?.jpg?.image_url;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: imageUrl ? [{ url: imageUrl }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

export default async function ProducerPage({ params }: PageProps) {
    const { id } = await params;
    const producerId = parseInt(id, 10);

    if (isNaN(producerId)) {
        notFound();
    }

    const [producer, anime] = await Promise.all([fetchProducerById(producerId), getProducerAnime(producerId)]);

    if (!producer) {
        notFound();
    }

    return <ProducerPageClient producer={producer} anime={anime} />;
}
