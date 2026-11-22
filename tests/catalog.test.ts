import assert from "node:assert/strict";
import test from "node:test";
import { getRecipe, recipes } from "../lib/catalog";
import { makeCustomRecipe } from "../lib/catalog/custom-recipe";
import { composePrompt, defaultPromptSettings } from "../lib/catalog/prompt";
import { categories, recipeOptions } from "../lib/catalog/recipes";
import { agentOptions, reaResources, resourceRegistry, workflowBoosters } from "../lib/catalog/resources";
import { styleOptions } from "../lib/catalog/styles";
import { readRecipeSettings, recipeSettingsParams } from "../lib/catalog/workflow-settings";

test("the catalog contains at least 100 distinct, usable recipe entries", () => {
  assert.ok(recipes.length >= 100);
  assert.equal(new Set(recipes.map(({ slug }) => slug)).size, recipes.length);
  assert.equal(new Set(recipes.map(({ workflow }) => workflow)).size, recipes.length);
  assert.equal(new Set(recipes.map(({ deliverable }) => deliverable)).size, recipes.length);
  assert.equal(new Set(recipes.map(({ checks }) => checks.join(" "))).size, recipes.length);

  for (const category of Object.keys(categories)) {
    assert.ok(recipes.some((recipe) => recipe.category === category), category);
  }

  for (const recipe of recipes) {
    assert.match(recipe.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(recipe.title && recipe.summary && recipe.workflow && recipe.deliverable && recipe.stack);
    const ids = [...recipe.resources, ...recipe.boosters];
    assert.equal(new Set(ids).size, ids.length, recipe.slug);
    for (const id of ids) assert.ok(resourceRegistry[id], id);
    assert.ok(recipe.resources.some((id) => resourceRegistry[id].kind === "Skill"), recipe.slug);
    assert.ok(recipe.resources.some((id) => resourceRegistry[id].kind === "Repository"), recipe.slug);
    assert.ok(recipe.resources.length >= 2 && recipe.resources.length <= 5, recipe.slug);
    for (const id of recipe.defaultBoosters) assert.ok(recipe.boosters.includes(id), id);
    for (const { id, default: initial } of recipe.options) {
      if (initial) assert.ok(recipeOptions[id].values.some(({ value }) => value === initial), recipe.slug);
    }
  }
});

test("every source is HTTPS and shared boosters are documentable", () => {
  for (const resource of Object.values(resourceRegistry)) {
    assert.equal(new URL(resource.url).protocol, "https:");
    if (resource.setupUrl) assert.equal(new URL(resource.setupUrl).protocol, "https:");
  }
  for (const id of workflowBoosters) assert.ok(resourceRegistry[id].badge, id);
});

test("every recipe composes for every style and agent", () => {
  for (const recipe of recipes) {
    const defaults = defaultPromptSettings(recipe);
    for (const style of styleOptions) {
      for (const agent of agentOptions) {
        const text = composePrompt(recipe, { ...defaults, style: style.value, agent: agent.value });
        assert.ok(text.startsWith(`# ${recipe.title}\n`), recipe.slug);
        assert.ok(text.includes(`- ${style.label}:`), recipe.slug);
        assert.ok(text.includes(`## Tools and setup · ${agent.label}`), recipe.slug);
        assert.ok(text.includes("## Acceptance checks"), recipe.slug);
        assert.ok(text.includes(recipe.checks[0]), recipe.slug);
        assert.doesNotMatch(text, /undefined/);
      }
    }
  }
});

test("the same recipe reflects brief, project options, boosters and target compatibility", () => {
  const saas = getRecipe("saas-landing-page")!;
  const custom = composePrompt(saas, {
    ...defaultPromptSettings(saas),
    agent: "codex",
    style: "editorial",
    boosters: ["21st"],
    brief: "  A workspace for pottery studios.  ",
    choices: { context: "existing" },
  });
  assert.match(custom, /Project brief\nA workspace for pottery studios\./);
  assert.match(custom, /Editorial:/);
  assert.match(custom, /Keep the existing stack/);
  assert.match(custom, /21st MCP/);
  assert.doesNotMatch(custom, /Playwright CLI/);

  const media = getRecipe("faceless-short")!;
  const video = composePrompt(media, {
    ...defaultPromptSettings(media),
    agent: "gemini",
    brief: "Explain how sourdough rises.",
    choices: { duration: "15", aspect: "1:1" },
  });
  assert.match(video, /15 seconds/);
  assert.match(video, /square 1:1/);
  assert.match(video, /Video brief\nExplain how sourdough rises\./);
  assert.match(video, /Run the render in this session/);
  assert.match(video, /finished, playable faceless-short\.mp4/);
  assert.match(video, /attach the file in your response or give its absolute path/);
  assert.match(video, /Use as a reference on this agent/);
  assert.match(video, /intelligible audio/);
  assert.doesNotMatch(video, /horizontal document overflow|deliver editable source|Recommended starting stack/);

  const analysis = getRecipe("owned-repository-architecture-map")!;
  const report = composePrompt(analysis, { ...defaultPromptSettings(analysis), choices: { "rea-output": "prototype" } });
  assert.match(report, /a small original prototype/);
  assert.match(report, /when the question needs artifact evidence/);
});

test("REA catalog and custom prompts reference only the official REA project", () => {
  const custom = makeCustomRecipe({
    category: "rea", title: "App observations", acceptanceChecks: "", resources: ["graphify", "playwright"],
  });
  for (const recipe of [...recipes.filter(({ category }) => category === "rea"), custom]) {
    assert.deepEqual(recipe.resources, reaResources);
    assert.equal(recipe.boosters.length, 0);
    assert.equal(recipe.defaultBoosters.length, 0);
    for (const agent of agentOptions) {
      const prompt = composePrompt(recipe, { ...defaultPromptSettings(recipe), agent: agent.value });
      assert.deepEqual(
        prompt.match(/https:\/\/[^)\s]+/g),
        reaResources.map((id) => resourceRegistry[id].url),
      );
      assert.match(prompt, /authorized builds/);
    }
  }
});

test("security audit recipes and custom audits produce read-only reports", () => {
  const audits = recipes.filter(({ category }) => category === "security");
  assert.equal(audits.length, 10);
  const custom = makeCustomRecipe({
    category: "security",
    title: "Server review",
    acceptanceChecks: "Cite the supplied firewall policy.",
    resources: ["security-best-practices", "playwright"],
  });

  for (const recipe of [...audits, custom]) {
    for (const agent of agentOptions) {
      const prompt = composePrompt(recipe, {
        ...defaultPromptSettings(recipe),
        agent: agent.value,
        brief: "Review the supplied staging configuration.",
      });
      assert.match(prompt, /Audit scope supplied by the user\nReview the supplied staging configuration\./);
      assert.match(prompt, /Use existing offline, read-only analysis/);
      assert.match(prompt, /Exclude live probing, vulnerability reproduction, exploit payloads, credential testing, new load generation, and changes/);
      assert.match(prompt, /recommended mitigation/);
      assert.match(prompt, /report presentation only/);
      assert.doesNotMatch(prompt, /Propose documented project-level setup|Recommended starting stack/);
    }
  }

  assert.match(getRecipe("pentest-readiness-and-findings-audit")!.workflow, /completed pentest report/);
  assert.match(getRecipe("stress-test-evidence-audit")!.workflow, /supplied load or stress-test summaries/);
});

test("custom recipes apply category defaults, checked resources and user acceptance checks", () => {
  const recipe = makeCustomRecipe({
    category: "video",
    title: "  Coffee roast explainer  ",
    acceptanceChecks: "  Each stage has a title.\n\nExport has captions.  ",
    resources: ["faceless", "playwright"],
  });
  const defaults = defaultPromptSettings(recipe);
  assert.equal(defaults.choices.aspect, "9:16");
  assert.deepEqual(recipe.checks, ["Each stage has a title.", "Export has captions."]);
  const prompt = composePrompt(recipe, { ...defaults, brief: "Teach new baristas." });
  assert.match(prompt, /^# Coffee roast explainer\n/);
  assert.match(prompt, /\[Faceless Shorts\]/);
  assert.match(prompt, /Optional workflow boosters\n- \[Playwright CLI\]/);
  assert.match(prompt, /Teach new baristas/);
  assert.match(prompt, /intelligible audio/);
});

test("recipe settings links validate supported choices and preserve explicit empty boosters", () => {
  const recipe = getRecipe("saas-landing-page")!;
  const params = new URLSearchParams("agent=constructor&style=editorial&boosters=&context=unsupported&brief=secret");
  const settings = readRecipeSettings(recipe, params);
  assert.equal(settings.agent, "universal");
  assert.equal(settings.style, "editorial");
  assert.equal(settings.choices.context, "auto");
  assert.deepEqual(settings.boosters, []);
  assert.equal(settings.brief, "");
  const shared = recipeSettingsParams(recipe, { ...settings, brief: "secret" });
  assert.equal(shared.get("boosters"), "");
  assert.equal(shared.has("brief"), false);
});
