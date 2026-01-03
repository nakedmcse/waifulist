import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { TracePageClient } from "./TracePageClient";

export const metadata: Metadata = createMetadata(
    "Anime Scene Search - WaifuList",
    "Upload an anime screenshot to identify the anime, episode, and timestamp",
);

export default function TracePage() {
    return <TracePageClient />;
}
