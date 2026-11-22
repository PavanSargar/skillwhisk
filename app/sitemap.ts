import type { MetadataRoute } from "next";
import { recipes } from "@/lib/catalog";
import { siteOrigin } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/custom", ...recipes.map(({ slug }) => `/recipes/${slug}`)]
    .map((path) => ({ url: new URL(path, siteOrigin).href }));
}
