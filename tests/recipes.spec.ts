import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { recipes } from "../lib/catalog";

test("catalog searches resources, filters categories and links to recipes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(`${recipes.length} recipes`, { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("video");
  await expect(page.getByText(`${recipes.filter(({ category }) => category === "video").length} recipes`, { exact: true })).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search recipes and tools" });
  await search.fill("faceless ffmpeg");
  await expect(page.getByText("1 recipe", { exact: true })).toBeVisible();
  await expect(page.getByRole("article", { name: "Faceless short", exact: true })).toBeVisible();
  await search.fill("unmatched search string");
  await expect(page.getByRole("heading", { name: "No recipes match" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText(`${recipes.length} recipes`, { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Faceless short", exact: true }).click();
  await expect(page).toHaveURL(/\/recipes\/faceless-short$/);
  await expect(page.getByRole("heading", { name: "Faceless short", level: 1 })).toBeVisible();
});

test("categories expand independently and search includes initially hidden recipes", async ({ page }) => {
  await page.goto("/");
  const landing = page.getByRole("region", { name: "Landing pages & portfolios" });
  const video = page.getByRole("region", { name: "Video & motion" });
  await expect(landing.getByRole("article")).toHaveCount(3);
  await expect(video.getByRole("article")).toHaveCount(3);
  const expand = landing.getByRole("button", { name: /Show \d+ more/ });
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expand.click();
  await expect(landing.getByRole("article")).toHaveCount(recipes.filter((recipe) => recipe.category === "landing").length);
  await expect(video.getByRole("article")).toHaveCount(3);
  const collapse = landing.getByRole("button", { name: /Show less/ });
  await expect(collapse).toHaveAttribute("aria-expanded", "true");
  await collapse.click();
  await expect(landing.getByRole("article")).toHaveCount(3);
  await page.getByRole("searchbox", { name: "Search recipes and tools" }).fill("minimal personal portfolio");
  await expect(landing.getByRole("article", { name: "Minimal personal portfolio" })).toBeVisible();
});

test("quick copy includes selected agent, style and defaults", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("combobox", { name: "Paste into" }).selectOption("codex");
  const row = page.getByRole("article", { name: "SaaS landing page", exact: true });
  await row.getByRole("combobox", { name: "UI style for SaaS landing page" }).click();
  await page.getByRole("option", { name: "Editorial", exact: true }).click();
  await row.getByRole("button", { name: "Copy prompt for SaaS landing page" }).click();
  await expect(row.getByRole("status")).toHaveText("Copied prompt for SaaS landing page.");
  const prompt = await page.evaluate(() => navigator.clipboard.readText());
  expect(prompt).toContain("# SaaS landing page");
  expect(prompt).toContain("Editorial:");
  expect(prompt).toContain("Tools and setup · Codex");
  expect(prompt).toContain("Playwright CLI");
});

test("style guidance responds to hover and keyboard navigation", async ({ page }) => {
  await page.goto("/");
  const picker = page.getByRole("combobox", { name: "UI style for SaaS landing page" });
  await picker.hover();
  await expect(page.locator(".style-tooltip")).toContainText("Use strong type");
  await picker.press("Enter");
  await expect(picker).toHaveAttribute("aria-activedescendant", /-option-brutalism$/);
  await page.keyboard.press("ArrowDown");
  await expect(picker).toHaveAttribute("aria-activedescendant", /-option-minimalism$/);
  await expect(page.locator(".style-option-preview")).toContainText("Use deliberate spacing");
  await page.getByRole("option", { name: "Claymorphism", exact: true }).hover();
  await expect(page.locator(".style-option-preview")).toContainText("Use rounded, softly lit forms");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(picker).toBeFocused();
  await expect(picker).toHaveText("Brutalism");
});

test("detail copy matches the customized preview", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/recipes/faceless-short");
  await page.getByRole("textbox", { name: /Video brief/ }).fill("Explain how sourdough rises.");
  await page.getByRole("combobox", { name: "Paste into" }).selectOption("gemini");
  await page.getByRole("combobox", { name: "UI style" }).click();
  await page.getByRole("option", { name: "Hand-drawn", exact: true }).click();
  await page.getByRole("combobox", { name: "Target duration" }).selectOption("15");
  await page.getByRole("combobox", { name: "Aspect ratio" }).selectOption("1:1");
  const preview = page.locator(".prompt-text");
  await expect(preview).toContainText("Explain how sourdough rises.");
  await expect(preview).toContainText("Hand-drawn:");
  await expect(preview).toContainText("Tools and setup · Gemini CLI");
  await expect(preview).toContainText("15 seconds");
  await expect(preview).toContainText("square 1:1");
  await expect(preview).toContainText("attach the file in your response");
  await page.getByRole("button", { name: "Copy prompt for Faceless short" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await preview.textContent());
  await page.getByRole("button", { name: "Copy review prompt" }).click();
  await expect(page.getByRole("region", { name: "What you get" }).getByRole("status")).toHaveText("Copied review prompt for Faceless short.");
  const review = await page.evaluate(() => navigator.clipboard.readText());
  expect(review).toContain("Explain how sourdough rises.");
  expect(review).toContain("Target duration: 15 seconds");
  expect(review).toContain("Aspect ratio: Square 1:1");
  expect(review).toContain("Visual direction: Hand-drawn");
  expect(review).toContain("FFprobe confirms the requested aspect ratio");
  expect(review).not.toContain("Run the render in this session");

  await page.goto("/recipes/role-based-admin-panel");
  const adminPreview = page.locator(".prompt-text");
  await page.getByRole("checkbox", { name: "Playwright CLI" }).uncheck();
  await page.getByRole("checkbox", { name: "21st MCP" }).check();
  await expect(adminPreview).toContainText("21st MCP");
  await expect(adminPreview).not.toContainText("Playwright CLI");
});

test("the mobile engagement recipe shows and copies the six SkillWhisk rules", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const mobile = page.getByRole("region", { name: "Mobile apps", exact: true });
  const row = mobile.getByRole("article", { name: "Habit-forming mobile app", exact: true });
  await expect(row.getByText("SkillWhisk rules", { exact: true })).toBeVisible();
  await row.getByRole("link", { name: "Habit-forming mobile app" }).click();
  const rules = page.locator("details").filter({ hasText: "SkillWhisk rules" });
  await rules.getByText("SkillWhisk rules", { exact: true }).click();
  await expect(rules.getByRole("listitem")).toHaveCount(6);
  await page.getByRole("button", { name: "Copy prompt for Habit-forming mobile app" }).click();
  const prompt = await page.evaluate(() => navigator.clipboard.readText());
  for (const title of ["The Itch", "The Lazy Thumb", "The Paved Path", "The Slot Machine", "The Bottomless Pit", "The Piggy Bank"]) {
    await expect(rules.getByText(title, { exact: true })).toBeVisible();
    expect(prompt).toContain(`**${title}.**`);
  }
  await page.goto("/recipes/habit-tracker");
  await expect(page.getByText("SkillWhisk rules", { exact: true })).toHaveCount(0);
});

test("custom builder generates a copyable recipe from its own brief, tools and checks", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("link", { name: "Create recipe" }).click();
  await expect(page).toHaveURL(/\/custom$/);
  const copy = page.getByRole("button", { name: /Copy prompt/ });
  await expect(copy).toBeDisabled();
  await page.getByRole("textbox", { name: "Recipe name" }).fill("Coffee roast explainer");
  await page.getByRole("textbox", { name: "Project brief" }).fill("Illustrate the three roast stages for a new barista.");
  await page.getByRole("combobox", { name: "Project type" }).selectOption("video");
  await page.getByRole("combobox", { name: "Target duration" }).selectOption("15");
  await page.getByRole("combobox", { name: "Paste into" }).selectOption("claude-code");
  await page.getByText("Skills and resources", { exact: true }).click();
  const resourceSearch = page.getByRole("searchbox", { name: "Find skills or resources" });
  await resourceSearch.fill("faceless");
  await page.getByRole("checkbox", { name: /Faceless Shorts/ }).check();
  await resourceSearch.fill("FFmpeg");
  await page.getByRole("checkbox", { name: /FFmpeg/ }).uncheck();
  await page.getByRole("textbox", { name: /Acceptance checks/ }).fill("Each roast stage has a spoken and visual label.");
  const preview = page.locator(".prompt-text");
  await expect(preview).toContainText("# Coffee roast explainer");
  await expect(preview).toContainText("three roast stages");
  await expect(preview).toContainText("15 seconds");
  await expect(preview).toContainText("Tools and setup · Claude Code");
  await expect(preview).toContainText("[Faceless Shorts]");
  await expect(preview).not.toContainText("[FFmpeg]");
  await expect(preview).toContainText("- [ ] Each roast stage has a spoken and visual label.");
  await copy.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await preview.textContent());
});

test("REA quick copy and custom recipes use the upstream project exclusively", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const repository = "https://github.com/morluto/rea";
  const skill = `${repository}/blob/main/.agents/skills/reverse-engineer-anything/SKILL.md`;
  await page.goto("/");
  const row = page.getByRole("article", { name: "Screenshot-to-layout spec" });
  await expect(row.getByRole("link", { name: "Reverse Engineer Anything Skill" })).toHaveAttribute("href", skill);
  await expect(row.getByRole("link", { name: "REA Repository" })).toHaveAttribute("href", repository);
  await row.getByRole("button", { name: "Copy prompt for Screenshot-to-layout spec" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.match(/https:\/\/[^)\s]+/g)).toEqual([skill, repository]);

  await page.goto("/custom");
  await page.getByRole("combobox", { name: "Project type" }).selectOption("rea");
  const sources = page.getByRole("list", { name: "REA resources" });
  await expect(sources.getByRole("link")).toHaveCount(2);
  const preview = await page.locator(".prompt-text").textContent();
  expect(preview?.match(/https:\/\/[^)\s]+/g)).toEqual([skill, repository]);
});

test("security audit recipes can be discovered, scoped, and copied as read-only prompts", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("security");
  const section = page.getByRole("region", { name: "Security audit", exact: true });
  await section.getByRole("button", { name: /Show \d+ more/ }).click();
  await expect(section.getByRole("link", { name: "Pentest readiness and findings audit" })).toBeVisible();
  await section.getByRole("link", { name: "Stress-test evidence audit" }).click();

  await page.getByRole("textbox", { name: /Audit scope/ }).fill("Review the attached staging k6 results.");
  const preview = page.locator(".prompt-text");
  await expect(preview).toContainText("Review the attached staging k6 results.");
  await expect(preview).toContainText("new load generation");
  await expect(page.getByRole("link", { name: "Grafana k6", exact: true })).toHaveAttribute("href", "https://github.com/grafana/k6");
  await expect(page.getByText(/GitHub stars/).first()).toBeVisible();
  await page.getByRole("button", { name: "Copy prompt for Stress-test evidence audit" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await preview.textContent());

  await page.goto("/custom");
  await page.getByRole("combobox", { name: "Project type" }).selectOption("security");
  await expect(page.getByRole("textbox", { name: "Audit scope", exact: true })).toBeVisible();
  await expect(page.locator(".prompt-text")).toContainText("Use existing offline, read-only analysis");
});

test("side-by-side prompt preview follows the recipe form height", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/custom");
  const form = page.getByRole("region", { name: "Your recipe" });
  const preview = page.getByRole("region", { name: "Prompt preview" });
  const panelSize = async () => {
    const formHeight = (await form.boundingBox())!.height;
    const previewHeight = (await preview.boundingBox())!.height;
    return { formHeight, previewHeight };
  };
  const initial = await panelSize();
  expect(initial.previewHeight).toBeCloseTo(initial.formHeight);

  await page.getByText("Skills and resources", { exact: true }).click();
  const expanded = await panelSize();
  expect(expanded.formHeight).toBeGreaterThan(initial.formHeight);
  expect(expanded.previewHeight).toBeCloseTo(expanded.formHeight);

  await page.goto("/recipes/faceless-short");
  const detailForm = page.getByRole("region", { name: "Customize the recipe" });
  expect((await preview.boundingBox())!.height).toBeCloseTo((await detailForm.boundingBox())!.height);
  const prompt = page.locator(".prompt-text");
  expect(await prompt.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  const formBox = (await detailForm.boundingBox())!;
  expect((await preview.boundingBox())!.y).toBeGreaterThan(formBox.y + formBox.height);
  expect((await prompt.boundingBox())!.height).toBeGreaterThan(200);
});

test("clipboard failure exposes and selects the exact prompt", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => { throw Error("Denied"); } },
    });
  });
  await page.goto("/recipes/habit-tracker");
  await page.getByRole("button", { name: "Copy prompt for Habit tracker" }).click();
  const fallback = page.getByRole("textbox", { name: /Copy the selected prompt manually/ });
  await expect(fallback).toBeFocused();
  expect(await fallback.inputValue()).toBe(await page.locator(".prompt-text").textContent());
  expect(await fallback.evaluate((element: HTMLTextAreaElement) => (
    element.selectionEnd - element.selectionStart === element.value.length
  ))).toBe(true);
});

test("narrow layouts work without document overflow, with keyboard and axe checks", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.getByRole("main")).toBeFocused();
  for (const path of ["/", "/custom", "/recipes/agency-lead-research-hub", "/recipes/responsive-behavior-mapping"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, path).toEqual([]);
  }
});

test("missing recipes have an actual 404 status and useful navigation", async ({ page }) => {
  const response = await page.goto("/recipes/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse recipes" })).toHaveAttribute("href", "/#recipes");
});
