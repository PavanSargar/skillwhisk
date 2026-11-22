import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";

test("recipe details show setup and output, save favorites, and share settings without the brief", async ({ browser, context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/recipes/faceless-short");
  await expect(page.getByRole("region", { name: "What you need" })).toContainText("local rendering tools");
  await expect(page.getByRole("region", { name: "What you get" })).toContainText("faceless-short.mp4");

  await page.getByRole("textbox", { name: /Video brief/ }).fill("Private studio idea");
  await page.getByRole("combobox", { name: "Paste into" }).selectOption("gemini");
  await page.getByText("Setup and fallbacks for Gemini CLI", { exact: true }).click();
  await expect(page.getByRole("region", { name: "What you need" })).toContainText("Reference material for Gemini CLI");
  await expect(page.getByRole("region", { name: "What you need" })).toContainText("Build the scene timeline with Remotion");

  await page.getByRole("combobox", { name: "UI style" }).click();
  await page.getByRole("option", { name: "Editorial", exact: true }).click();
  await page.getByRole("combobox", { name: "Target duration" }).selectOption("15");
  await page.getByRole("button", { name: "Save recipe" }).click();
  await expect(page.getByRole("button", { name: "Save recipe" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Share settings" }).click();
  const shared = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  expect(shared.pathname).toBe("/recipes/faceless-short");
  expect(shared.searchParams.get("agent")).toBe("gemini");
  expect(shared.searchParams.get("style")).toBe("editorial");
  expect(shared.searchParams.get("duration")).toBe("15");
  expect(shared.href).not.toContain("Private");

  await page.reload();
  await expect(page.getByRole("textbox", { name: /Video brief/ })).toHaveValue("Private studio idea");
  await expect(page.getByRole("button", { name: "Save recipe" })).toHaveAttribute("aria-pressed", "true");

  const guest = await browser.newContext();
  try {
    const sharedPage = await guest.newPage();
    await sharedPage.goto(shared.href);
    await expect(sharedPage.getByRole("combobox", { name: "Paste into" })).toHaveValue("gemini");
    await expect(sharedPage.getByRole("combobox", { name: "UI style" })).toHaveText("Editorial");
    await expect(sharedPage.getByRole("combobox", { name: "Target duration" })).toHaveValue("15");
    await expect(sharedPage.getByRole("textbox", { name: /Video brief/ })).toHaveValue("");
  } finally {
    await guest.close();
  }

  await page.goto("/");
  await page.getByRole("button", { name: "Saved recipes" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("link", { name: "Faceless short", exact: true }).click();
  await page.getByRole("button", { name: "Save recipe" }).click();
  await page.goto("/");
  await page.getByRole("button", { name: "Saved recipes" }).click();
  await expect(page.getByRole("heading", { name: "No saved recipes yet" })).toBeVisible();
});

test("custom drafts stay local and the downloaded skill contains the selected workflow", async ({ browser, context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/custom");
  await page.getByRole("combobox", { name: "Project type" }).selectOption("security");
  await page.getByRole("textbox", { name: "Recipe name" }).fill("Private audit title");
  await page.getByRole("textbox", { name: "Audit scope" }).fill("Private audit brief");
  await page.getByRole("textbox", { name: /Acceptance checks/ }).fill("Private check");
  await page.getByRole("combobox", { name: "Paste into" }).selectOption("codex");
  await page.getByText("Skills and resources", { exact: true }).click();
  await page.getByRole("searchbox", { name: "Find skills or resources" }).fill("grafana k6");
  await page.getByRole("checkbox", { name: /Grafana k6 Repository/ }).check();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Recipe name" })).toHaveValue("Private audit title");
  await expect(page.getByRole("textbox", { name: "Audit scope" })).toHaveValue("Private audit brief");
  await expect(page.getByRole("textbox", { name: /Acceptance checks/ })).toHaveValue("Private check");
  await expect(page.locator(".prompt-text")).toContainText("Grafana k6");

  await page.getByRole("button", { name: "Share settings" }).click();
  const shared = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  expect(shared.pathname).toBe("/custom");
  expect(shared.searchParams.get("category")).toBe("security");
  expect(shared.searchParams.get("agent")).toBe("codex");
  expect(shared.searchParams.get("resources")?.split(",")).toContain("k6");
  expect(shared.href).not.toContain("Private");

  const guest = await browser.newContext();
  try {
    const sharedPage = await guest.newPage();
    await sharedPage.goto(shared.href);
    await expect(sharedPage.getByRole("textbox", { name: "Audit scope" })).toHaveValue("");
    await expect(sharedPage.getByRole("textbox", { name: "Recipe name" })).toHaveValue("");
    await expect(sharedPage.locator(".prompt-text")).toContainText("Grafana k6");
  } finally {
    await guest.close();
  }

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download skill" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("skillwhisk-custom-security.zip");
  const files = unzipSync(await readFile(await download.path()));
  expect(Object.keys(files).sort()).toEqual([
    "skillwhisk-custom-security/SKILL.md",
    "skillwhisk-custom-security/references/recipe.md",
  ]);
  const skill = strFromU8(files["skillwhisk-custom-security/SKILL.md"]);
  const instructions = strFromU8(files["skillwhisk-custom-security/references/recipe.md"]);
  expect(skill).toMatch(/^---\nname: skillwhisk-custom-security\ndescription: ".+"\n---/);
  expect(skill).toContain("(references/recipe.md)");
  expect(instructions).toContain("Use existing offline, read-only analysis");
  expect(instructions).toContain("Grafana k6");
  expect(skill + instructions).not.toContain("Private");
});
