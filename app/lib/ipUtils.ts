import { NextRequest } from "next/server";

function extractIp(ipString: string): string {
    const ipSplit = ipString.split(":");
    if (ipSplit.length === 1 || (ipSplit.length > 2 && !ipString.includes("]"))) {
        return ipString;
    }
    if (ipSplit.length === 2) {
        return ipSplit[0];
    }
    return ipSplit
        .slice(0, ipSplit.length - 1)
        .join(":")
        .replace(/\[/, "")
        .replace(/]/, "");
}

export function getClientIP(request: NextRequest): string {
    return getIpFromHeaders(request.headers);
}

export function getIpFromHeaders(headers: Headers): string {
    const cfIP = headers.get("cf-connecting-ip");
    if (cfIP) {
        return extractIp(cfIP);
    }
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        return extractIp(forwarded.split(",")[0].trim());
    }
    const realIP = headers.get("x-real-ip");
    if (realIP) {
        return extractIp(realIP);
    }
    return "unknown";
}
