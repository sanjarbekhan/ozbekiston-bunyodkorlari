import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/biz_haqimizda", destination: "/haqida", permanent: true },
      { source: "/bunyodkorlar_sahifasi", destination: "/bunyodkorlar", permanent: true },
      { source: "/tavsiyalar", destination: "/tavsiyalari", permanent: true },
      { source: "/iqtiboslar_sahifasi", destination: "/sahifasi", permanent: true },
      { source: "/rss", destination: "/rss.xml", permanent: true },
    ];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    }];
  },
};

export default nextConfig;
