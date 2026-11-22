import type { PromptRecipe } from "./prompt";
import { categories, type CategoryId, type Profile } from "./recipes";
import { reaResources, workflowBoosters, type BoosterId, type ResourceId } from "./resources";

export const customRecipeDefaults = {
  landing: ["frontend-design", "next", "web-guidelines"],
  admin: ["shadcn", "table", "playwright"],
  marketing: ["openseo", "next", "web-guidelines"],
  commerce: ["frontend-design", "next", "forms"],
  mobile: ["expo-skill", "expo", "native-a11y"],
  video: ["remotion-skills", "remotion", "ffmpeg"],
  design: ["frontend-design", "storybook", "axe"],
  product: ["shadcn", "next", "playwright"],
  quality: ["web-guidelines", "axe", "playwright-test"],
  security: ["security-best-practices", "owasp-asvs", "owasp-cheatsheets"],
  rea: reaResources,
} as const satisfies Record<CategoryId, readonly ResourceId[]>;

const profileDefaults: Record<Profile, Pick<PromptRecipe, "deliverable" | "workflow" | "options">> = {
  "public-web": {
    deliverable: "A runnable, responsive site that fulfills the brief, with working primary navigation and actions.",
    workflow: "Identify the audience and primary action. Plan page structure and use supplied content or labeled fixtures. Implement and verify the main visitor journey.",
    options: [{ id: "context" }],
  },
  "web-app": {
    deliverable: "A runnable interface with a working primary flow and any persistence, permissions or integration setup required by the brief.",
    workflow: "Define the primary journey, data and relevant states. Build the smallest complete flow and exercise it with realistic test data.",
    options: [{ id: "context" }],
  },
  mobile: {
    deliverable: "A runnable mobile app with a device setup command and any fixtures required to try the primary flow.",
    workflow: "Plan native screens and navigation around the main task. Implement relevant storage, permissions and failure states, then verify the flow on a device or simulator when available.",
    options: [{ id: "context" }],
  },
  media: {
    deliverable: "An editable timeline or scene source and a playable media export in the selected format, with captions where relevant.",
    workflow: "Build a timed script or shot list, assemble permitted assets, and produce the edit with readable visuals and balanced audio. Inspect the rendered export.",
    options: [{ id: "duration" }, { id: "aspect" }],
  },
  audit: {
    deliverable: "A prioritized findings report with evidence and a verified patch for fixes within the brief's scope.",
    workflow: "Establish a reproducible baseline, trace findings to their causes, and verify each scoped change using the same conditions.",
    options: [],
  },
  "security-audit": {
    deliverable: "An evidence-backed security report with prioritized findings, recommendations, and gaps in coverage.",
    workflow: "Identify the supplied target and controls in scope. Review the shared evidence, document observed issues and assumptions, and rank the findings by impact and confidence.",
    options: [],
  },
  analysis: {
    deliverable: "An evidence-backed report and any diagrams or prototype requested in the brief or selected in the recipe.",
    workflow: "Trace the permitted materials and document observed behavior and evidence. Mark unknowns, then deliver the selected analysis output.",
    options: [{ id: "rea-output" }],
  },
};

interface CustomRecipeInput {
  category: CategoryId;
  title: string;
  acceptanceChecks: string;
  resources: readonly ResourceId[];
}

function isBooster(id: ResourceId): id is BoosterId {
  return workflowBoosters.some((booster) => booster === id);
}

export function makeCustomRecipe(input: CustomRecipeInput): PromptRecipe {
  const category = categories[input.category];
  const selectedResources = input.category === "rea" ? reaResources : input.resources;
  const boosters = selectedResources.filter(isBooster);

  return {
    ...profileDefaults[category.profile],
    title: input.title.trim() || "Custom recipe",
    summary: category.name,
    stack: category.stack,
    style: category.style,
    profile: category.profile,
    checks: input.acceptanceChecks.split("\n").map((line) => line.trim()).filter(Boolean),
    resources: selectedResources.filter((id) => !isBooster(id)),
    boosters,
    defaultBoosters: boosters,
  };
}
