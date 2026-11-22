"use client";

import type { ReactNode } from "react";
import { CopyButton } from "./copy-button";

export function PromptPreview({
  title,
  prompt,
  canCopy = true,
  copyHint = "Enter a recipe name and project brief to enable copying.",
  actions,
}: { title: string; prompt: string; canCopy?: boolean; copyHint?: string; actions?: ReactNode }) {
  return (
    <section className="prompt-panel" aria-labelledby="preview-heading">
      <div className="prompt-header">
        <h2 id="preview-heading">Prompt preview</h2>
        <div className="prompt-actions">
          {actions}
          <CopyButton recipeTitle={title} getText={() => prompt} disabled={!canCopy} />
        </div>
      </div>
      {!canCopy && <p className="preview-hint">{copyHint}</p>}
      <pre className="prompt-text" tabIndex={0} aria-labelledby="preview-heading">{prompt}</pre>
    </section>
  );
}
