"use client";

import { useState } from "react";
import { composePrompt, defaultPromptSettings, maxBriefLength } from "@/lib/catalog/prompt";
import { recipeOptions, type Recipe } from "@/lib/catalog/recipes";
import { agentOptions, resourceRegistry, type Agent, type BoosterId } from "@/lib/catalog/resources";
import { PromptPreview } from "./prompt-preview";
import { SelectControl } from "./select-control";
import { StylePicker } from "./style-picker";

export function RecipeConfigurator({ recipe }: { recipe: Recipe }) {
  const [settings, setSettings] = useState(() => defaultPromptSettings(recipe));
  const prompt = composePrompt(recipe, settings);
  const renderMp4 = recipe.delivery === "rendered-mp4";
  const securityAudit = recipe.profile === "security-audit";
  const briefLabel = securityAudit ? "Audit scope" : renderMp4 ? "Video brief" : "Project brief";
  const briefPlaceholder = securityAudit ? "Which target and redacted evidence should the audit cover?"
    : renderMp4 ? "What should the short be about?" : "Who is it for? What should it do?";

  function toggleBooster(id: BoosterId, enabled: boolean) {
    setSettings((current) => ({
      ...current,
      boosters: enabled ? [...current.boosters, id] : current.boosters.filter((booster) => booster !== id),
    }));
  }

  return (
    <div className="configurator">
      <section className="config-panel" aria-labelledby="customize-heading">
        <h2 id="customize-heading">Customize the recipe</h2>
        <div className="brief-control">
          <label className="control-label" htmlFor="project-brief">{briefLabel} <span className="optional">(optional)</span></label>
          <textarea
            id="project-brief"
            rows={4}
            placeholder={briefPlaceholder}
            maxLength={maxBriefLength}
            value={settings.brief}
            onChange={(event) => setSettings({ ...settings, brief: event.target.value })}
          />
          <span className="field-hint">{settings.brief.length}/{maxBriefLength} characters</span>
        </div>
        <div className="config-fields">
          <SelectControl
            id="recipe-agent" label="Paste into" options={agentOptions} value={settings.agent}
            onChange={(event) => setSettings({ ...settings, agent: event.target.value as Agent })}
          />
          <StylePicker
            id="recipe-style" label="UI style" value={settings.style}
            onChange={(style) => setSettings({ ...settings, style })}
          />
          {recipe.options.map(({ id }) => (
            <SelectControl
              id={`option-${id}`} key={id} label={recipeOptions[id].label} options={recipeOptions[id].values}
              value={settings.choices[id] ?? ""}
              onChange={(event) => setSettings({ ...settings, choices: { ...settings.choices, [id]: event.target.value } })}
            />
          ))}
        </div>
        {recipe.boosters.length > 0 && (
          <fieldset className="booster-options">
            <legend className="control-label">Workflow boosters</legend>
            {recipe.boosters.map((id) => (
              <label key={id}>
                <input type="checkbox" checked={settings.boosters.includes(id)} onChange={(event) => toggleBooster(id, event.target.checked)} />
                <span>{resourceRegistry[id].name}</span>
              </label>
            ))}
          </fieldset>
        )}
      </section>
      <PromptPreview title={recipe.title} prompt={prompt} />
    </div>
  );
}
