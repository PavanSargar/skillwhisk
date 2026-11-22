import type { MetadataRoute } from "next";
import { recipes } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return [];
  return ["/", "/custom", ...recipes.map(({ slug }) => `/recipes/${slug}`)]
    .map((path) => ({ url: new URL(path, siteUrl).href }));
}
