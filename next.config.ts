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
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/tilda/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tildacdn.com https://*.tildacdn.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tildacdn.com https://*.tildacdn.net; font-src 'self' https://fonts.gstatic.com https://*.tildacdn.com https://*.tildacdn.net data:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; connect-src 'self' https:; frame-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https:; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
