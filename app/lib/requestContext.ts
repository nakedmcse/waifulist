import { headers } from "next/headers";
import { getIpFromHeaders } from "@/lib/ipUtils";

export interface RequestContext {
    ip: string;
    page: string;
    isRsc: boolean;
    isPrefetch: boolean;
}

export async function getRequestContext(): Promise<RequestContext> {
    try {
        const headersList = await headers();
        const ip = getIpFromHeaders(headersList);
        const page = headersList.get("x-request-page") || "unknown";
        const isRsc = headersList.get("x-request-rsc") === "1";
        const isPrefetch = headersList.get("x-request-prefetch") === "1";
        return { ip, page, isRsc, isPrefetch };
    } catch {
        return { ip: "unknown", page: "unknown", isRsc: false, isPrefetch: false };
    }
}
