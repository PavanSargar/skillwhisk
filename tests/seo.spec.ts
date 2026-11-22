import { expect, test } from "@playwright/test";
import { recipes } from "../lib/catalog";
import { homeDescription, homeTitle, shareImage, siteOrigin } from "../lib/seo";

test("public pages render canonical metadata, structured data, and footer attribution", async ({ page }) => {
  const recipe = recipes.find(({ slug }) => slug === "faceless-short")!;
  const pages = [
    { path: "/", title: homeTitle, description: homeDescription },
    {
      path: "/custom",
      title: "Create a custom AI recipe | SkillWhisk",
      description: "Create a copy-ready AI recipe with your own brief, curated skills and GitHub repositories, a visual style, and acceptance checks.",
    },
    { path: `/recipes/${recipe.slug}`, title: `${recipe.title} | SkillWhisk`, description: recipe.summary },
  ];

  for (const { path, title, description } of pages) {
    const canonical = new URL(path, siteOrigin).href;
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
    const canonicalLink = await page.locator('link[rel="canonical"]').getAttribute("href");
    const openGraphUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(new URL(canonicalLink!).href).toBe(canonical);
    expect(new URL(openGraphUrl!).href).toBe(canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new URL(shareImage.url, siteOrigin).href);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", new URL(shareImage.url, siteOrigin).href);
    await expect(page.getByRole("contentinfo").getByText("Powered by Waystoweb Technologies")).toBeVisible();
  }

  const structuredData = page.locator('script[type="application/ld+json"]');
  const breadcrumbs = JSON.parse((await structuredData.textContent())!);
  expect(breadcrumbs).toMatchObject({
    "@type": "BreadcrumbList",
    itemListElement: [
      { position: 1, item: siteOrigin.href },
      { position: 2, item: new URL(`/recipes/${recipe.slug}`, siteOrigin).href },
    ],
  });

  await page.goto("/");
  expect(JSON.parse((await structuredData.textContent())!)).toMatchObject({
    "@type": "WebSite", name: "SkillWhisk", url: siteOrigin.href,
  });
});

test("robots advertises a complete sitemap and the social image renders", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(`Sitemap: ${new URL("/sitemap.xml", siteOrigin).href}`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const locations = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(locations).toEqual(
    ["/", "/custom", ...recipes.map(({ slug }) => `/recipes/${slug}`)].map((path) => new URL(path, siteOrigin).href),
  );

  const image = await request.get(shareImage.url);
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  const png = await image.body();
  expect(png.readUInt32BE(16)).toBe(shareImage.width);
  expect(png.readUInt32BE(20)).toBe(shareImage.height);
});
