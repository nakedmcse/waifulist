import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://waifulist.moe";
const OG_IMAGE = "https://waifuvault.moe/assets/custom/images/vic_vault.webp";

export const sharedMetadata = {
    siteName: "WaifuList",
    image: {
        url: OG_IMAGE,
        alt: "WaifuList",
        width: 300,
        height: 335,
        type: "image/webp",
    },
} as const;

export function createMetadata(title: string, description: string): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [sharedMetadata.image],
            siteName: sharedMetadata.siteName,
            type: "website",
        },
        twitter: {
            title,
            description,
            card: "summary_large_image",
            images: [sharedMetadata.image.url],
        },
    };
}

export const baseMetadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    authors: [{ name: "Victoria" }],
    icons: {
        apple: "/favicon.ico",
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
    },
    keywords: [
        "anime",
        "anime tracker",
        "anime list",
        "watchlist",
        "myanimelist",
        "anime database",
        "anime rating",
        "anime progress",
        "watch history",
        "anime catalog",
    ],
    manifest: "/site.webmanifest",
};
