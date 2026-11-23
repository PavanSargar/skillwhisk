"use client";

import { useEffect, useRef, useState } from "react";
import { ActionTooltip } from "./action-tooltip";

export function CopyButton({ getText, recipeTitle, disabled, kind = "prompt" }: {
  getText: () => string;
  recipeTitle: string;
  disabled?: boolean;
  kind?: "prompt" | "settings" | "review";
}) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [manualText, setManualText] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isShare = kind === "settings";
  const isReview = kind === "review";
  const copyItem = isShare ? "settings link" : isReview ? "review prompt" : "prompt";

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

  const copied = state === "copied";
  const label = copied ? `Copied ${copyItem}` : `Copy ${copyItem}`;
  const button = (
    <button
      type="button"
      className={isShare ? "button secondary-button icon-button" : isReview ? "button secondary-button" : "button copy-button"}
      onClick={copy}
      disabled={disabled}
      aria-label={isShare ? "Share settings" : isReview ? label : `${label} for ${recipeTitle}`}
    >
      {copied || !isShare ? (
        <span className={copied ? "check-icon" : "copy-icon"} aria-hidden="true" />
      ) : (
        <span className="transfer-icon share-icon" aria-hidden="true"><span /></span>
      )}
      {!isShare && (copied && !isReview ? "Copied" : label)}
    </button>
  );

  return (
    <>
      {isShare ? <ActionTooltip label={copied ? "Link copied" : "Share settings"}>{button}</ActionTooltip> : button}
      <span className="sr-only" role="status">
        {copied ? `Copied ${copyItem} for ${recipeTitle}.` : ""}
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
