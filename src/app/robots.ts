import type { MetadataRoute } from "next";

const SITE_URL = "https://www.bunyodkor.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/profiles-sitemap.xml`,
      `${SITE_URL}/rss.xml`,
      `${SITE_URL}/atom.xml`,
    ],
  };
}
