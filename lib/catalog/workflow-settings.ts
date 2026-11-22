import { maxBriefLength, defaultPromptSettings, type PromptRecipe, type PromptSettings } from "./prompt";
import { categories, recipeOptions, type CategoryId, type OptionId } from "./recipes";
import { agents, reaResources, resourceRegistry, type Agent, type ResourceId } from "./resources";
import { styles, type StyleId } from "./styles";

export const maxRecipeNameLength = 90;
export const maxChecksLength = 800;

export interface LocalDraft {
  settings: string;
  title: string;
  brief: string;
  checks: string;
}

export interface CustomSettings {
  category: CategoryId;
  agent: Agent;
  style?: StyleId;
  resources?: readonly ResourceId[];
  choices: PromptSettings["choices"];
}

const customDefaults: CustomSettings = { category: "landing", agent: "universal", choices: {} };
const choiceIds = Object.keys(recipeOptions) as OptionId[];

export function parseLocalJson(raw: string | null): unknown {
  try {
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function readDraft(raw: string | null): LocalDraft {
  const parsed = parseLocalJson(raw);
  const fields = typeof parsed === "object" && parsed ? parsed as Partial<Record<keyof LocalDraft, unknown>> : {};
  const text = (value: unknown, max: number) => typeof value === "string" ? value.slice(0, max) : "";
  return {
    settings: text(fields.settings, 6000),
    title: text(fields.title, maxRecipeNameLength),
    brief: text(fields.brief, maxBriefLength),
    checks: text(fields.checks, maxChecksLength),
  };
}

function namedOption<T extends string>(params: URLSearchParams, key: string, options: Record<T, unknown>) {
  const value = params.get(key);
  return value && Object.hasOwn(options, value) ? value as T : undefined;
}

function readChoices(params: URLSearchParams, ids: readonly OptionId[], base: PromptSettings["choices"]) {
  const choices = { ...base };
  for (const id of ids) {
    const value = params.get(id);
    if (value && recipeOptions[id].values.some((option) => option.value === value)) choices[id] = value;
  }
  return choices;
}

function writeChoices(params: URLSearchParams, choices: PromptSettings["choices"]) {
  for (const id of choiceIds) {
    const value = choices[id];
    if (value) params.set(id, value);
  }
}

export function readRecipeSettings(
  recipe: PromptRecipe,
  params: URLSearchParams,
  defaults = defaultPromptSettings(recipe),
): PromptSettings {
  const boosters = params.get("boosters")?.split(",");
  return {
    ...defaults,
    agent: namedOption(params, "agent", agents) ?? defaults.agent,
    style: namedOption(params, "style", styles) ?? defaults.style,
    boosters: boosters ? recipe.boosters.filter((id) => boosters.includes(id)) : defaults.boosters,
    choices: readChoices(params, recipe.options.map(({ id }) => id), defaults.choices),
  };
}

export function recipeSettingsParams(recipe: PromptRecipe, settings: PromptSettings) {
  const params = new URLSearchParams({ agent: settings.agent, style: settings.style });
  if (recipe.boosters.length) params.set("boosters", settings.boosters.join(","));
  writeChoices(params, settings.choices);
  return params;
}

export function readCustomSettings(params: URLSearchParams, defaults = customDefaults): CustomSettings {
  const resources = params.get("resources")?.split(",")
    .filter((id): id is ResourceId => Object.hasOwn(resourceRegistry, id) && !reaResources.some((resource) => resource === id));
  return {
    category: namedOption(params, "category", categories) ?? defaults.category,
    agent: namedOption(params, "agent", agents) ?? defaults.agent,
    style: namedOption(params, "style", styles) ?? defaults.style,
    resources: resources ? [...new Set(resources)] : defaults.resources,
    choices: readChoices(params, choiceIds, defaults.choices),
  };
}

export function customSettingsParams(settings: CustomSettings) {
  const params = new URLSearchParams({ category: settings.category, agent: settings.agent });
  if (settings.style) params.set("style", settings.style);
  if (settings.resources) params.set("resources", settings.resources.join(","));
  writeChoices(params, settings.choices);
  return params;
}
