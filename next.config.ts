import type { NextConfig } from "next";

const apiBase =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5001";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright e2e uses 127.0.0.1; allow dev HMR from that host.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/api/v1/:path*`,
      },
      {
        source: "/api/ai/:path*",
        destination: `${apiBase}/api/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;
