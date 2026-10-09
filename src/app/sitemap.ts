import type { MetadataRoute } from "next";
import { getProfileSitemapRows, profileLastModified } from "@/lib/profile-sitemap";

export const revalidate = 60;

const SITE_URL = "https://www.bunyodkor.com";
const url = (path: string) => `${SITE_URL}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await getProfileSitemapRows();
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/bunyodkorlar"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/reyting"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/bunyodkor-ai"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/haqida"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/tavsiyalari"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/iqtiboslar"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/hamkor-loyihasi"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/ariza-qoldirish"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/ommaviy_ofertasi"), changeFrequency: "yearly", priority: 0.3 },
    ...profiles.filter((profile) => Boolean(profile.slug)).map((profile) => ({
      url: url("/bunyodkorlar/" + encodeURIComponent(profile.slug)),
      lastModified: profileLastModified(profile),
    })),
  ];
}
