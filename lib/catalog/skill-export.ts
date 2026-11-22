import { composePrompt, type PromptRecipe, type PromptSettings } from "./prompt";

export function skillFiles(id: string, recipe: PromptRecipe, settings: PromptSettings) {
  const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52).replace(/-$/, "");
  const name = `skillwhisk-${slug || "recipe"}`;
  const description = `${recipe.summary} Use when the user asks for the ${recipe.title} workflow.`;
  return {
    name,
    files: {
      [`${name}/SKILL.md`]: [
        "---",
        `name: ${name}`,
        `description: ${JSON.stringify(description)}`,
        "---",
        "",
        `# ${recipe.title}`,
        "",
        "Read [the recipe](references/recipe.md) and use it for the requested outcome.",
        "Confirm any essential inputs and check the tools available in the current agent before starting.",
        "",
      ].join("\n"),
      [`${name}/references/recipe.md`]: composePrompt(recipe, { ...settings, agent: "universal", brief: "" }) + "\n",
    },
  };
}
