import { recipeOptions, type Profile, type Recipe } from "@/lib/catalog/recipes";
import { agents, resourceRegistry } from "@/lib/catalog/resources";
import { composeReviewPrompt, type PromptSettings } from "@/lib/catalog/prompt";
import { CopyButton } from "./copy-button";

const inputs: Record<Profile, string> = {
  "public-web": "A project brief and an agent with access to your website workspace.",
  "web-app": "A description of the main workflow and an agent with access to your app workspace.",
  mobile: "A mobile app brief and a workspace that can run React Native tooling.",
  media: "A video topic, permitted assets, and an agent with access to rendering tools.",
  audit: "The app or pages to review, plus access to supporting code or evidence.",
  "security-audit": "An authorized target and its relevant code, configuration, or redacted test results.",
  analysis: "A permitted reference, app build, or local snapshot and the behavior you want to understand.",
};

export function RecipeOverview({ recipe, settings }: { recipe: Recipe; settings: PromptSettings }) {
  const { agent } = settings;
  const agentName = agents[agent].name;
  const tools = [...new Set([...recipe.resources, ...settings.boosters])].map((id) => resourceRegistry[id]);
  const notes = tools.flatMap((resource) => {
    const referenceOnly = agent !== "universal" && resource.documentedAgents && !resource.documentedAgents.includes(agent);
    const setup = referenceOnly ? `Reference material for ${agentName}.` : resource.setup;
    return setup || resource.fallback ? [{ name: resource.name, setup, fallback: resource.fallback }] : [];
  });
  const mp4 = recipe.delivery === "rendered-mp4";
  const duration = recipeOptions.duration.values.find(({ value }) => value === settings.choices.duration);
  const aspect = recipeOptions.aspect.values.find(({ value }) => value === settings.choices.aspect);

  return (
    <div className="recipe-overview">
      <section aria-labelledby="requirements-heading">
        <h2 id="requirements-heading">What you need</h2>
        <p>{mp4 ? "An agent with local rendering tools and a permitted narration voice. The video brief is optional." : inputs[recipe.profile]}</p>
        {notes.length > 0 && (
          <details className="recipe-setup">
            <summary>{agent === "universal" ? "Setup and fallbacks" : `Setup and fallbacks for ${agentName}`}</summary>
            <ul>
              {notes.map(({ name, setup, fallback }) => (
                <li key={name}>
                  <strong>{name}</strong>
                  {setup && <p>{setup}</p>}
                  {fallback && <p>{fallback}</p>}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
      <section aria-labelledby="deliverable-heading">
        <h2 id="deliverable-heading">What you get</h2>
        <p>{mp4 ? <>A playable <code>faceless-short.mp4</code> in the selected format.</> : recipe.deliverable}</p>
        {mp4 && duration && aspect && <p className="field-hint">{duration.label} · {aspect.label}</p>}
        <div className="recipe-review">
          <CopyButton kind="review" recipeTitle={recipe.title} getText={() => composeReviewPrompt(recipe, settings)} />
        </div>
      </section>
    </div>
  );
}
