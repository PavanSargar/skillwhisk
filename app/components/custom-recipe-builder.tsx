"use client";

import { useState } from "react";
import { customRecipeDefaults, makeCustomRecipe } from "@/lib/catalog/custom-recipe";
import { composePrompt, defaultPromptSettings, maxBriefLength, type PromptSettings } from "@/lib/catalog/prompt";
import { categories, recipeOptions, type CategoryId } from "@/lib/catalog/recipes";
import { agentOptions, reaResources, resourceRegistry, type Agent, type ResourceId } from "@/lib/catalog/resources";
import { customSettingsParams, maxChecksLength, maxRecipeNameLength, readCustomSettings, type CustomSettings, type LocalDraft } from "@/lib/catalog/workflow-settings";
import { PromptPreview } from "./prompt-preview";
import { RecipeUtilities } from "./recipe-utilities";
import { SelectControl } from "./select-control";
import { StylePicker } from "./style-picker";
import { useWorkflowDraft } from "./use-workflow-storage";

const categoryOptions = Object.entries(categories).map(([value, category]) => ({ value, label: category.name }));
const resourcesByName = (Object.keys(resourceRegistry) as ResourceId[])
  .filter((id) => !reaResources.some((resource) => resource === id))
  .sort((first, second) => resourceRegistry[first].name.localeCompare(resourceRegistry[second].name));

function ResourcePicker({ selected, onChange, onReset }: {
  selected: readonly ResourceId[];
  onChange: (id: ResourceId, checked: boolean) => void;
  onReset: () => void;
}) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase();
  const options = resourcesByName.filter((id) => {
    const resource = resourceRegistry[id];
    return [resource.name, resource.kind, resource.badge].join(" ").toLocaleLowerCase().includes(search);
  });

  return (
    <details className="builder-resources">
      <summary>
        <strong>Skills and resources</strong>
        <span>{selected.length} selected</span>
      </summary>
      <div className="builder-resource-body">
        <div className="builder-resource-controls">
          <label htmlFor="resource-search" className="sr-only">Find skills or resources</label>
          <input
            id="resource-search" type="search" placeholder="Find skills or resources"
            value={query} onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" className="plain-button" onClick={onReset}>Use suggested resources</button>
        </div>
        {options.length > 0 ? (
          <fieldset className="builder-resource-list">
            <legend className="sr-only">Resources to include</legend>
            {options.map((id) => {
              const resource = resourceRegistry[id];
              return (
                <label key={id}>
                  <input type="checkbox" checked={selected.includes(id)} onChange={(event) => onChange(id, event.target.checked)} />
                  <span>{resource.name}</span>
                  <span className="role-badge">{resource.badge ?? resource.kind}</span>
                </label>
              );
            })}
          </fieldset>
        ) : <p>No resources match that search.</p>}
      </div>
    </details>
  );
}

export function CustomRecipeBuilder() {
  const { draft, shared, saveDraft } = useWorkflowDraft("skillwhisk:draft:custom");
  const { title, brief, checks } = draft;
  const selection = readCustomSettings(shared, readCustomSettings(new URLSearchParams(draft.settings)));
  const { category, style, agent, choices, resources } = selection;
  const securityAudit = category === "security";
  const selected = resources ?? customRecipeDefaults[category];
  const recipe = makeCustomRecipe({ category, title, acceptanceChecks: checks, resources: selected });
  const defaults = defaultPromptSettings(recipe);
  const settings: PromptSettings = { ...defaults, brief, style: style ?? defaults.style, agent, choices: { ...defaults.choices, ...choices } };
  const shareParams = customSettingsParams({
    category, agent, style: settings.style, resources: category === "rea" ? undefined : selected,
    choices: Object.fromEntries(recipe.options.map(({ id }) => [id, settings.choices[id]])),
  });

  function saveText(changes: Partial<Pick<LocalDraft, "title" | "brief" | "checks">>) {
    saveDraft({ ...draft, ...changes, settings: customSettingsParams(selection).toString() });
  }

  function saveSelection(changes: Partial<CustomSettings>) {
    saveDraft({ ...draft, settings: customSettingsParams({ ...selection, ...changes }).toString() });
  }

  return (
    <div className="configurator">
      <section className="config-panel builder-panel" aria-labelledby="builder-heading">
        <h2 id="builder-heading">Your recipe</h2>
        <div className="brief-control">
          <label htmlFor="custom-title" className="control-label">Recipe name</label>
          <input id="custom-title" className="text-control" placeholder="e.g. Photography booking site" value={title}
            onChange={(event) => saveText({ title: event.target.value })} maxLength={maxRecipeNameLength} required />
        </div>
        <div className="brief-control">
          <label htmlFor="custom-brief" className="control-label">{securityAudit ? "Audit scope" : "Project brief"}</label>
          <textarea id="custom-brief" rows={4} placeholder={securityAudit ? "Which target and redacted evidence should the audit cover?" : "Who is it for? What should it do?"} value={brief}
            onChange={(event) => saveText({ brief: event.target.value })} maxLength={maxBriefLength} required />
          <span className="field-hint">Drafts are saved in this browser.</span>
        </div>
        <div className="config-fields">
          <SelectControl id="custom-category" label="Project type" value={category} options={categoryOptions}
            onChange={(event) => saveSelection({ category: event.target.value as CategoryId })} />
          <StylePicker id="custom-style" label="UI style" value={settings.style} onChange={(style) => saveSelection({ style })} />
          <SelectControl id="custom-agent" label="Paste into" value={agent} options={agentOptions}
            onChange={(event) => saveSelection({ agent: event.target.value as Agent })} />
          {recipe.options.map(({ id }) => (
            <SelectControl key={id} id={`custom-${id}`} label={recipeOptions[id].label} options={recipeOptions[id].values}
              value={settings.choices[id] ?? ""} onChange={(event) => saveSelection({ choices: { ...choices, [id]: event.target.value } })} />
          ))}
        </div>
        {category === "rea" ? (
          <div className="brief-control">
            <p className="control-label" id="rea-resources-label">REA resources</p>
            <ul className="resource-strip" role="list" aria-labelledby="rea-resources-label">
              {reaResources.map((id) => (
                <li key={id}><a className="resource-chip" href={resourceRegistry[id].url}>{resourceRegistry[id].name}</a></li>
              ))}
            </ul>
          </div>
        ) : (
          <ResourcePicker
            selected={selected}
            onChange={(id, checked) => saveSelection({ resources: checked ? [...selected, id] : selected.filter((item) => item !== id) })}
            onReset={() => saveSelection({ resources: undefined })}
          />
        )}
        <div className="brief-control">
          <label htmlFor="custom-checks" className="control-label">Acceptance checks <span className="optional">(optional)</span></label>
          <textarea id="custom-checks" rows={3} placeholder="One check per line" value={checks}
            onChange={(event) => saveText({ checks: event.target.value })} maxLength={maxChecksLength} />
        </div>
      </section>
      <PromptPreview title={recipe.title} prompt={composePrompt(recipe, settings)} canCopy={Boolean(title.trim() && brief.trim())}
        copyHint={securityAudit ? "Enter a recipe name and audit scope to enable copying." : undefined}
        actions={
          <RecipeUtilities path="/custom" params={shareParams} skillId={`custom-${category}`}
            recipe={{ ...recipe, title: `${categories[category].name} recipe`, checks: [] }} settings={settings} />
        } />
    </div>
  );
}
