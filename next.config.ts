import type { NextConfig } from "next";

const apiBase =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5001";

const nextConfig: NextConfig = {
  output: "standalone",
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
