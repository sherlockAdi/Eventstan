import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ?? "https://api.eventstan.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/proxy/:path*", destination: `${apiBaseUrl}/:path*` }];
  },
};

export default nextConfig;
