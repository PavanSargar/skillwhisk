import type { Metadata } from "next";

export const siteName = "SkillWhisk";
export const homeTitle = "SkillWhisk — Copy-ready AI recipes and agent skills";
export const homeDescription = "Browse copy-ready AI prompts with curated agent skills and GitHub repositories for websites, mobile apps, videos, and security audits.";

export const siteOrigin = new URL(process.env.SITE_URL?.trim() || "https://skillwhisk.vercel.app");
if (
  !["http:", "https:"].includes(siteOrigin.protocol)
  || siteOrigin.pathname !== "/" || siteOrigin.search || siteOrigin.hash
  || siteOrigin.username || siteOrigin.password
) {
  throw new Error("SITE_URL must be an HTTP(S) origin such as https://example.com.");
}

export const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "SkillWhisk — Copy-ready AI recipes",
};

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, siteOrigin);
  const fullTitle = path === "/" ? title : `${title} | ${siteName}`;
  const image = { ...shareImage, url: new URL(shareImage.url, siteOrigin) };

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName, title: fullTitle, description, url, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [{ url: image.url, alt: image.alt }] },
  };
}
