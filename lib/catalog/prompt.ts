import { recipeOptions, type OptionId, type Profile, type Recipe } from "./recipes";
import { agents, resourceRegistry, type Agent, type BoosterId, type ResourceId } from "./resources";
import { styles, type StyleId } from "./styles";

export const maxBriefLength = 1500;

export interface PromptSettings {
  agent: Agent;
  style: StyleId;
  brief: string;
  boosters: readonly BoosterId[];
  choices: Partial<Record<OptionId, string>>;
}

export type PromptRecipe = Pick<Recipe, "title" | "summary" | "deliverable" | "delivery" | "workflow" | "stack" | "style" | "profile" | "options" | "boosters" | "defaultBoosters"> & {
  checks: readonly string[];
  resources: readonly ResourceId[];
};

export function defaultPromptSettings(recipe: Pick<PromptRecipe, "style" | "options" | "defaultBoosters">): PromptSettings {
  return {
    agent: "universal",
    style: recipe.style,
    brief: "",
    boosters: recipe.defaultBoosters,
    choices: Object.fromEntries(recipe.options.map(({ id, default: initial }) => [
      id, initial ?? recipeOptions[id].values[0].value,
    ])),
  };
}

const webAccess = "Walk the primary journey with keyboard only. Check visible focus, logical order, accessible names, readable contrast, zoom and reduced motion. Use axe where available and manually check behavior that automation cannot assess.";
const appChecks = "Verify real actions and persisted data where required. Exercise relevant loading, empty, invalid, pending, failure and success states. Provide a clear recovery path.";
const mediaPlayback = "Inspect the full export for readable text, timing, safe margins and intelligible audio. Include accurate captions or a transcript where there is speech. Avoid unnecessary flashing.";

type GeneralProfile = Exclude<Profile, "security-audit">;

const qualityChecks: Record<GeneralProfile, readonly string[]> = {
  "public-web": [
    webAccess,
    "Check mobile navigation and every key page at narrow and desktop widths. Remove horizontal document overflow and optimize images with stable dimensions and appropriate alternatives.",
    "Check working buttons, links and footer destinations, clickable logo and contact paths where applicable, page titles, descriptions, favicon, a useful 404 and the current copyright year. Remove placeholder text and unused navigation.",
    "Verify forms with both valid and invalid submissions and useful success and error feedback.",
  ],
  "web-app": [webAccess, appChecks, "Use fixtures to verify core flows, including a narrow-screen layout and any applicable permission boundaries."],
  mobile: [
    "Check platform accessibility labels and roles, screen-reader order, large text, touch targets, safe areas and software keyboard behavior.",
    appChecks, "Use a device or emulator when available. Exercise relevant permission, offline and restart states, and record which device scenarios you ran.",
  ],
  media: [
    mediaPlayback,
    "Report the rendered file, exact media properties, source assets and applicable permissions. If you cannot render locally, deliver editable source and the exact render command, and state that the export is pending.",
  ],
  audit: [webAccess, "Capture a reproducible baseline, validate the changed flow afterward, and report evidence and any findings still open."],
  analysis: [
    "Work from supplied material, public references you can inspect, or systems and code the user owns or has permission to analyze. Cite only observed locations or the ranges supplied. Label reconstructions, assumptions and unknowns explicitly, including unseen validation or authentication.",
    "For a prototype, use original or licensed materials and verify the relevant responsive, keyboard and accessible interaction behavior.",
  ],
};

const styleContext: Record<GeneralProfile, string> = {
  "public-web": "Apply this direction to the website.",
  "web-app": "Apply this direction to the interface while keeping data and controls easy to read.",
  mobile: "Adapt this direction to native controls, navigation and platform accessibility conventions.",
  media: "Apply this direction to frames, titles, transitions and any thumbnail or end card.",
  audit: "Use this direction for any new or revised UI within the agreed patch scope.",
  analysis: "Use this direction for any prototype or visual deliverable without altering what the evidence shows.",
};

function resourceLine(id: ResourceId, agent: Agent, referenceOnly = false) {
  const resource = resourceRegistry[id];
  const citation = `- [${resource.name}](${resource.url}) (${resource.kind}) — ${resource.role}`;
  if (referenceOnly) return citation;
  const reference = resource.documentedAgents && agent !== "universal" && !resource.documentedAgents.includes(agent);
  const notes = [
    reference ? "Use as a reference on this agent and follow the fallback for the corresponding step." : "",
    resource.setup,
    resource.setupUrl ? `[Official setup](${resource.setupUrl}).` : "",
    resource.fallback ? `Fallback: ${resource.fallback}` : "",
  ].filter(Boolean).join(" ");
  return `${citation}${notes ? `\n  ${notes}` : ""}`;
}

export function composePrompt(recipe: PromptRecipe, settings: PromptSettings) {
  const style = styles[settings.style];
  const agent = agents[settings.agent];
  const brief = settings.brief.trim().slice(0, maxBriefLength);
  const boosters = recipe.boosters.filter((id) => settings.boosters.includes(id));

  if (recipe.profile === "security-audit") {
    const checks = [
      ...recipe.checks,
      "Give each finding a severity, confidence, affected component, evidence reference, impact, and recommended mitigation. Explicitly list unverified controls and gaps.",
      "Redact credentials, tokens, personal data, and sensitive values in the report.",
    ];

    return [
      `# ${recipe.title}`,
      recipe.summary,
      brief && `## Audit scope supplied by the user\n${brief}`,
      "## Read-only scope\nReview only the authorized app, site, server, or local source named or supplied by the user. Work from provided code, configuration, redacted exports, and completed test results. Use URLs and hostnames as scope identifiers. Request the missing artifacts if evidence is insufficient.",
      "Use existing offline, read-only analysis on those artifacts. Exclude live probing, vulnerability reproduction, exploit payloads, credential testing, new load generation, and changes to the target or its files.",
      `## Tools and setup · ${agent.name}\nUse the linked resources as references for interpreting the supplied material. Follow the read-only scope when a linked workflow describes other actions.`,
      [...recipe.resources, ...boosters].map((id) => resourceLine(id, settings.agent, true)).join("\n"),
      `## Workflow\n${recipe.workflow}`,
      `## Deliverable\n${recipe.deliverable}\n- ${style.name}: Apply this style to report presentation only. Plain Markdown is sufficient.`,
      `## Acceptance checks\n${checks.map((check) => `- [ ] ${check}`).join("\n")}`,
    ].filter(Boolean).join("\n\n");
  }

  const defaults = defaultPromptSettings(recipe);
  const choices = recipe.options.map(({ id }) => {
    const control = recipeOptions[id];
    const value = control.values.find((option) => option.value === settings.choices[id])
      ?? control.values.find((option) => option.value === defaults.choices[id]);
    return value?.instruction;
  }).filter(Boolean);
  const analysis = recipe.profile === "analysis";
  const renderMp4 = recipe.delivery === "rendered-mp4";
  const setup = renderMp4
    ? "Check for usable rendering tools and a permitted voice in the current session before starting. Use an available local renderer if the skill is unavailable and follow the host's permission prompts."
    : "Check available tools first. Propose documented project-level setup only when it materially helps and follow the host's permission prompts. If a tool or integration is unavailable, continue with the workflow below using existing tools, local fixtures or a manual check. Keep secrets in the intended configuration environment.";
  const instructions = [
    recipe.workflow,
    renderMp4
      ? "Run the render in this session and save the finished video as faceless-short.mp4. Use the simplest rendering workflow that can produce the requested video."
      : "Use the simplest implementation that delivers the stated outcome. Follow the user's project constraints and treat the starting stack as a default. Reuse existing work and ask for essential input only when it would change the result. Use realistic labeled sample data when real inputs are unavailable.",
    renderMp4
      ? "Verify that the MP4 exists and plays, then attach the file in your response or give its absolute path in the shared workspace. If rendering is blocked, name the missing requirement and report that the MP4 is pending."
      : "Run the applicable checks and report what actually passed along with any checks you could not run.",
  ];
  const checks = [...recipe.checks, ...(renderMp4 ? [mediaPlayback] : qualityChecks[recipe.profile])];
  return [
    `# ${recipe.title}`,
    recipe.summary,
    brief && `## ${renderMp4 ? "Video brief" : "Project brief"}\n${brief}`,
    `## Deliverable\n${recipe.deliverable}`,
    `## ${renderMp4 ? "Rendering and visual direction" : "Stack and visual direction"}\n- ${renderMp4 ? "Suggested render tools" : "Recommended starting stack"}: ${recipe.stack}\n- ${style.name}: ${style.guidance} ${styleContext[recipe.profile]}`,
    choices.length > 0 && choices.map((choice) => `- ${choice}`).join("\n"),
    `## Tools and setup · ${agent.name}\n${analysis
      ? "Use the upstream Reverse Engineer Anything skill as the sole specialized analysis resource. Apply it to supported, authorized builds when the question needs artifact evidence. Scope the work to observable behavior and documented access. When available evidence is sufficient or the REA connection is unavailable, work from the supplied material and record whether REA was applicable and used."
      : agent.guidance}${!analysis && "url" in agent ? ` Official guide: ${agent.url}` : ""}`,
    !analysis && setup,
    recipe.resources.map((id) => resourceLine(id, settings.agent)).join("\n"),
    boosters.length > 0 && `### Optional workflow boosters\n${boosters.map((id) => resourceLine(id, settings.agent)).join("\n")}`,
    `## Workflow\n${instructions.map((step, index) => `${index + 1}. ${step}`).join("\n")}`,
    `## Acceptance checks\n${checks.map((check) => `- [ ] ${check}`).join("\n")}`,
  ].filter(Boolean).join("\n\n");
}
