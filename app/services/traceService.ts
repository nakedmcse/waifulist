import { TraceMoeResult, TraceQuotaInfo } from "@/types/traceMoe";

export type TraceSearchResponse = {
    frameCount?: number;
    error?: string;
    result?: TraceMoeResult[];
    code?: string;
    retryAfter?: number;
};

export async function getQuota(): Promise<TraceQuotaInfo | null> {
    try {
        const response = await fetch("/api/anime/trace/quota");
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch trace quota:", error);
        return null;
    }
}

export async function searchImage(file: File, cutBorders: boolean): Promise<TraceSearchResponse> {
    try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("cutBorders", cutBorders.toString());

        const response = await fetch("/api/anime/trace", {
            method: "POST",
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error("Failed to search image:", error);
        return { error: error instanceof Error ? error.message : "Failed to search" };
    }
}
