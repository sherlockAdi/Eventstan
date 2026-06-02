import type { NextConfig } from "next";

const LARAVEL_LOCAL = "http://localhost:8000";
const LARAVEL_LIVE  = "https://your-live-domain.com"; // 🔁 Replace with your live domain

const isLive = process.env.NEXT_PUBLIC_ENV === "live";
const LARAVEL_BASE = isLive ? LARAVEL_LIVE : LARAVEL_LOCAL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source:      "/api/proxy/:path*",
        destination: `${LARAVEL_BASE}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        // Add X-Requested-With on all proxied requests so Laravel's
        // VerifyCsrfToken middleware treats them as AJAX (API) calls.
        source: "/api/proxy/:path*",
        headers: [
          { key: "X-Requested-With", value: "XMLHttpRequest" },
        ],
      },
    ];
  },
};

export default nextConfig;
