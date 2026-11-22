"use client";

import { useState } from "react";
import { skillFiles } from "@/lib/catalog/skill-export";
import type { PromptRecipe, PromptSettings } from "@/lib/catalog/prompt";
import { ActionTooltip } from "./action-tooltip";
import { CopyButton } from "./copy-button";
import { useFavoriteRecipes } from "./use-workflow-storage";

export function SaveRecipeButton({ slug }: { slug: string }) {
  const { favorites, toggleFavorite } = useFavoriteRecipes();
  const saved = favorites.includes(slug);
  return (
    <ActionTooltip label="Save recipe">
      <button type="button" className="button secondary-button icon-button save-recipe" aria-label="Save recipe"
        aria-pressed={saved} onClick={() => toggleFavorite(slug)}>
        <span className="bookmark-icon" aria-hidden="true" />
      </button>
    </ActionTooltip>
  );
}

export function RecipeUtilities({ path, params, skillId, recipe, settings }: {
  path: string;
  params: URLSearchParams;
  skillId: string;
  recipe: PromptRecipe;
  settings: PromptSettings;
}) {
  const [downloadError, setDownloadError] = useState(false);

  async function downloadSkill() {
    setDownloadError(false);
    try {
      const { zipSync, strToU8 } = await import("fflate");
      const { name, files } = skillFiles(skillId, recipe, settings);
      const entries = Object.fromEntries(Object.entries(files).map(([filename, text]) => [filename, strToU8(text)]));
      const bytes = new Uint8Array(zipSync(entries));
      const href = URL.createObjectURL(new Blob([bytes.buffer], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = href;
      link.download = `${name}.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      setDownloadError(true);
    }
  }

  return (
    <>
      <CopyButton recipeTitle={recipe.title} kind="settings" getText={() => {
        const url = new URL(path, window.location.origin);
        url.search = params.toString();
        return url.href;
      }} />
      <ActionTooltip label="Download skill">
        <button type="button" className="button secondary-button icon-button" aria-label="Download skill" onClick={downloadSkill}>
          <span className="transfer-icon" aria-hidden="true"><span /></span>
        </button>
      </ActionTooltip>
      {downloadError && <p className="workflow-error" role="status">Couldn’t download the skill. Try again.</p>}
    </>
  );
}
