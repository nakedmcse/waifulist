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
        ],
    },
};

export default nextConfig;
