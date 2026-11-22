import type { BoosterId, ResourceId } from "./resources";
import type { StyleId } from "./styles";

export const recipeOptions = {
  context: {
    label: "Project context",
    values: [
      { value: "auto", label: "Infer from workspace", instruction: "Inspect the workspace first. Adapt to its stack when it contains a project, or use the recommended starting stack in a new workspace." },
      { value: "new", label: "New project", instruction: "Create a new project using the recommended stack in an empty or explicitly chosen location." },
      { value: "existing", label: "Improve an existing project", instruction: "Keep the existing stack and conventions. Identify the relevant entry points before changing files." },
    ],
  },
  duration: {
    label: "Target duration",
    values: [
      { value: "30", label: "30 seconds", instruction: "Target a finished runtime of 30 seconds." },
      { value: "15", label: "15 seconds", instruction: "Target a finished runtime of 15 seconds." },
      { value: "60", label: "60 seconds", instruction: "Target a finished runtime of 60 seconds." },
    ],
  },
  aspect: {
    label: "Aspect ratio",
    values: [
      { value: "9:16", label: "Vertical 9:16", instruction: "Compose for 9:16 vertical video. Keep captions and key visuals clear of social platform overlay areas." },
      { value: "16:9", label: "Landscape 16:9", instruction: "Compose for 16:9 landscape video. Reframe shots and titles for the wider canvas." },
      { value: "1:1", label: "Square 1:1", instruction: "Compose for square 1:1 video. Reframe shots and titles to keep them clear and readable." },
    ],
  },
  "rea-output": {
    label: "Analysis deliverable",
    values: [
      { value: "report", label: "Report", instruction: "Deliver the evidence-backed report and any diagrams or specifications requested by the recipe." },
      { value: "prototype", label: "Report and prototype", instruction: "Deliver the evidence-backed report and a small original prototype of the behaviors in scope, using permitted materials." },
    ],
  },
} as const;

export type OptionId = keyof typeof recipeOptions;

export const categories = {
  landing: { name: "Landing pages & portfolios", description: "Launch pages, case studies, and sites built around a clear audience.", profile: "public-web", style: "minimalism", stack: "Next.js, TypeScript and semantic CSS. Use static content where it serves the brief." },
  admin: { name: "Admin & internal tools", description: "Dashboards and workspaces for people who do the work.", profile: "web-app", style: "swiss-grid", stack: "Next.js, TypeScript and shadcn/ui. Use local fixtures for development and a database for records that must persist across users." },
  marketing: { name: "Marketing & sales", description: "Research, acquisition, campaigns, and pipelines.", profile: "web-app", style: "swiss-grid", stack: "Next.js and TypeScript with a small data model. Build the core workflow with fixtures before connecting external services." },
  commerce: { name: "Commerce & booking", description: "Storefronts and flows that take people from browsing to confirmation.", profile: "public-web", style: "minimalism", stack: "Next.js and TypeScript. Use server-side validation and sandbox integrations for payment or booking when needed." },
  mobile: { name: "Mobile apps", description: "Native workflows for phones, with device states built in.", profile: "mobile", style: "minimalism", stack: "Expo, React Native and TypeScript. Use Expo Router for multiple screens and local persistence where needed." },
  video: { name: "Video & motion", description: "Scaffold editable timelines and render something people can watch.", profile: "media", style: "editorial", stack: "Remotion and TypeScript for editable compositions, with FFmpeg and FFprobe for encoding and verification." },
  design: { name: "Design & components", description: "Reusable patterns, tokens, and interfaces with a point of view.", profile: "web-app", style: "swiss-grid", stack: "React and TypeScript with semantic CSS variables. Use Storybook when isolated examples serve the deliverable." },
  product: { name: "Product & SaaS", description: "Useful portals, collaboration tools, and customer workflows.", profile: "web-app", style: "minimalism", stack: "Next.js and TypeScript with scoped server-side data access. Start with an explicit persistence and permissions model." },
  quality: { name: "Quality & accessibility", description: "Find defects and verify focused fixes in an existing project.", profile: "audit", style: "minimalism", stack: "Use the existing stack, browser tooling and the project's test commands. Capture before-and-after evidence." },
  security: { name: "Security audit", description: "Review supplied code, configurations, and test evidence for security and resilience risks.", profile: "security-audit", style: "minimalism", stack: "Use supplied code, configuration, and redacted test evidence with existing offline read-only tools." },
  rea: { name: "REA — Reverse Engineer Anything", description: "Use the upstream REA skill to document observable app behavior and evidence.", profile: "analysis", style: "swiss-grid", stack: "Use the upstream REA project for supported artifact analysis. Deliver findings as a Markdown report with evidence references." },
} as const;

export type CategoryId = keyof typeof categories;
export type Profile = (typeof categories)[CategoryId]["profile"];

export interface RecipeDraft {
  slug: string;
  title: string;
  summary: string;
  delivery?: "rendered-mp4";
  workflow: string;
  deliverable: string;
  checks: readonly [string, string, ...string[]];
  resources: readonly [ResourceId, ResourceId, ...ResourceId[]];
  boosters?: readonly BoosterId[];
  defaultBoosters?: readonly BoosterId[];
  style?: StyleId;
  profile?: Profile;
  stack?: string;
  options?: readonly { id: OptionId; default?: string }[];
}

export interface Recipe extends RecipeDraft {
  category: CategoryId;
  profile: Profile;
  style: StyleId;
  stack: string;
  options: NonNullable<RecipeDraft["options"]>;
  boosters: NonNullable<RecipeDraft["boosters"]>;
  defaultBoosters: NonNullable<RecipeDraft["defaultBoosters"]>;
}

export function defineRecipes(category: CategoryId, drafts: readonly RecipeDraft[]): Recipe[] {
  const settings = categories[category];
  return drafts.map((draft) => {
    const profile = draft.profile ?? settings.profile;
    const usesProject = profile === "public-web" || profile === "web-app" || profile === "mobile";
    return {
      ...draft,
      category,
      profile,
      style: draft.style ?? settings.style,
      stack: draft.stack ?? settings.stack,
      options: draft.options ?? (usesProject ? [{ id: "context" }] : []),
      boosters: draft.boosters ?? [],
      defaultBoosters: draft.defaultBoosters ?? [],
    };
  });
}
