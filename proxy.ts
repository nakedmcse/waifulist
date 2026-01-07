import { NextRequest, NextResponse } from "next/server";
import { getRedis, REDIS_KEYS } from "@/lib/redis";
import { RateLimitType } from "@/types/rateLimit";

const RATE_LIMITS: Record<RateLimitType, Record<string, number>> = {
    page: { requests: 60, window: 60 },
    api: { requests: 120, window: 60 },
} as const;

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

function getClientIP(request: NextRequest): string {
    const cfIP = request.headers.get("cf-connecting-ip");
    if (cfIP) {
        return extractIp(cfIP);
    }
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return extractIp(forwarded.split(",")[0].trim());
    }
    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
        return extractIp(realIP);
    }
    return "unknown";
}

async function checkRateLimit(
    ip: string,
    type: RateLimitType,
): Promise<{ allowed: boolean; remaining: number; resetIn: number; limit: number }> {
    const redis = getRedis();
    const { requests, window } = RATE_LIMITS[type];
    const key = REDIS_KEYS.RATE_LIMIT(ip, type);

    const count = await redis.incr(key);

    if (count === 1) {
        await redis.expire(key, window);
    }

    const ttl = await redis.ttl(key);
    const resetIn = ttl > 0 ? ttl : window;

    if (count > requests) {
        return { allowed: false, remaining: 0, resetIn, limit: requests };
    }

    return { allowed: true, remaining: requests - count, resetIn, limit: requests };
}

export async function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const rscHeader = request.headers.get("rsc");
    const hasRscParam = searchParams.has("_rsc");

    const nextUrl = request.headers.get("next-url");
    const isPrefetch = nextUrl !== null && nextUrl !== pathname;
    const isAuthEndpoint = pathname.startsWith("/api/auth/");
    if (hasRscParam || rscHeader === "1" || isPrefetch || isAuthEndpoint) {
        return NextResponse.next();
    }

    const ip = getClientIP(request);
    const type: RateLimitType = pathname.startsWith("/api/") ? "api" : "page";
    const { allowed, remaining, resetIn, limit } = await checkRateLimit(ip, type);

    if (!allowed) {
        console.warn(
            `[RateLimit] ${type} limit exceeded | IP: ${ip} | URL: ${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
        );
        return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
                "Retry-After": String(resetIn),
                "X-RateLimit-Limit": String(limit),
                "X-RateLimit-Remaining": "0",
            },
        });
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
}

export const config = {
    matcher: ["/anime/:path*", "/character/:path*", "/person/:path*", "/api/:path*"],
};
