"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({ getText, recipeTitle, disabled, kind = "prompt" }: {
  getText: () => string;
  recipeTitle: string;
  disabled?: boolean;
  kind?: "prompt" | "settings";
}) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [manualText, setManualText] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isPrompt = kind === "prompt";
  const copyItem = isPrompt ? "prompt" : "settings link";

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
        className={isPrompt ? "button copy-button" : "plain-button"}
        onClick={copy}
        disabled={disabled}
        aria-label={isPrompt ? `${state === "copied" ? "Copied prompt" : "Copy prompt"} for ${recipeTitle}` : "Share settings"}
      >
        {isPrompt && <span className={state === "copied" ? "check-icon" : "copy-icon"} aria-hidden="true" />}
        {state === "copied" ? (isPrompt ? "Copied" : "Link copied") : (isPrompt ? "Copy prompt" : "Share settings")}
      </button>
      <span className="sr-only" role="status">
        {state === "copied" ? `Copied ${copyItem} for ${recipeTitle}.` : ""}
      </span>
      {state === "manual" && (
        <label className="manual-copy">
          <span>Clipboard access is unavailable. Copy the selected {copyItem} manually.</span>
          <textarea ref={textarea} readOnly rows={5} value={manualText} />
        </label>
      )}
    </>
  );
}
