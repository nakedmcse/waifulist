import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
            },
            {
                protocol: "https",
                hostname: "api-cdn.myanimelist.net",
            },
            {
                protocol: "https",
                hostname: "api.trace.moe",
            },
            // Streaming platform favicons
            {
                protocol: "https",
                hostname: "www.crunchyroll.com",
            },
            {
                protocol: "https",
                hostname: "assets.nflxext.com",
            },
            {
                protocol: "https",
                hostname: "www.funimation.com",
            },
            {
                protocol: "https",
                hostname: "www.amazon.com",
            },
            {
                protocol: "https",
                hostname: "www.hulu.com",
            },
            {
                protocol: "https",
                hostname: "www.hidive.com",
            },
            {
                protocol: "https",
                hostname: "www.disneyplus.com",
            },
        ],
    },
};

export default nextConfig;
