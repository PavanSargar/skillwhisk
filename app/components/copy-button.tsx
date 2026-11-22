"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({ getText, recipeTitle, disabled }: { getText: () => string; recipeTitle: string; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [manualText, setManualText] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (state === "manual") {
      textarea.current?.focus();
      textarea.current?.select();
    }
  }, [state, manualText]);

  async function copy() {
    const text = getText();
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      timer.current = setTimeout(() => setState("idle"), 2600);
    } catch {
      setManualText(text);
      setState("manual");
      textarea.current?.focus();
      textarea.current?.select();
    }
  }

  return (
    <>
      <button
        type="button"
        className="button copy-button"
        onClick={copy}
        disabled={disabled}
        aria-label={`${state === "copied" ? "Copied prompt" : "Copy prompt"} for ${recipeTitle}`}
      >
        <span className={state === "copied" ? "check-icon" : "copy-icon"} aria-hidden="true" />
        {state === "copied" ? "Copied" : "Copy prompt"}
      </button>
      <span className="sr-only" role="status">
        {state === "copied" ? `Copied prompt for ${recipeTitle}.` : ""}
      </span>
      {state === "manual" && (
        <label className="manual-copy">
          <span>Clipboard access is unavailable. Copy the selected prompt manually.</span>
          <textarea ref={textarea} readOnly rows={5} value={manualText} />
        </label>
      )}
    </>
  );
}
