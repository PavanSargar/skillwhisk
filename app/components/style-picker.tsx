"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { styleOptions, styles, type StyleId } from "@/lib/catalog/styles";

interface StylePickerProps {
  id: string;
  label: string;
  value: StyleId;
  onChange: (style: StyleId) => void;
  hideLabel?: boolean;
}

export function StylePicker({ id, label, value, onChange, hideLabel }: StylePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeStyle, setActiveStyle] = useState(value);
  const keyboardNavigation = useRef(false);
  const activeId = `${id}-option-${activeStyle}`;

  useEffect(() => {
    if (open && keyboardNavigation.current) {
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeId, open]);

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      keyboardNavigation.current = true;
      setActiveStyle(value);
    }
    setOpen(nextOpen);
  }

  function selectStyle(style: StyleId) {
    onChange(style);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (open && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectStyle(activeStyle);
      return;
    }

    const index = styleOptions.findIndex((option) => option.value === (open ? activeStyle : value));
    const lastIndex = styleOptions.length - 1;
    let target: StyleId | undefined;
    switch (event.key) {
      case "ArrowDown":
        target = styleOptions[open ? Math.min(index + 1, lastIndex) : index].value;
        break;
      case "ArrowUp":
        target = styleOptions[open ? Math.max(index - 1, 0) : index].value;
        break;
      case "Home":
        target = styleOptions[0].value;
        break;
      case "End":
        target = styleOptions[lastIndex].value;
        break;
      default:
        if (/^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const candidates = [...styleOptions.slice(index + 1), ...styleOptions.slice(0, index + 1)];
          target = candidates.find((option) => option.label.toLowerCase().startsWith(event.key.toLowerCase()))?.value;
        }
    }

    if (target) {
      event.preventDefault();
      keyboardNavigation.current = true;
      setOpen(true);
      setActiveStyle(target);
    }
  }

  return (
    <div className="select-control">
      <label className={hideLabel ? "sr-only" : "control-label"} id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <Popover.Root open={open} onOpenChange={changeOpen}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Popover.Trigger
              id={id}
              role="combobox"
              aria-haspopup="listbox"
              aria-controls={open ? `${id}-options` : undefined}
              aria-activedescendant={open ? activeId : undefined}
              aria-labelledby={`${id}-label`}
              className="style-trigger"
              onKeyDown={handleKeyDown}
            >
              <span>{styles[value].name}</span>
              <span className="style-chevron" aria-hidden="true" />
            </Popover.Trigger>
          </Tooltip.Trigger>
          {!open && (
            <Tooltip.Portal>
              <Tooltip.Content className="style-tooltip" sideOffset={6} collisionPadding={12}>
                <strong>{styles[value].name}</strong>
                {styles[value].guidance}
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </Tooltip.Root>
        <Popover.Portal>
          <Popover.Content
            role="presentation"
            className="style-menu"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div role="listbox" id={`${id}-options`} aria-labelledby={`${id}-label`} className="style-options">
              {styleOptions.map(({ value: option, label: name }) => (
                <button
                  type="button"
                  role="option"
                  key={option}
                  id={`${id}-option-${option}`}
                  className="style-option"
                  data-highlighted={option === activeStyle ? "" : undefined}
                  aria-label={name}
                  aria-selected={option === value}
                  aria-describedby={`${id}-hint-${option}`}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectStyle(option)}
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse") {
                      keyboardNavigation.current = false;
                      setActiveStyle(option);
                    }
                  }}
                >
                  <span>{name}</span>
                  {option === value && <span className="check-icon" aria-hidden="true" />}
                  <span id={`${id}-hint-${option}`} className="sr-only">{styles[option].guidance}</span>
                </button>
              ))}
            </div>
            <div className="style-option-preview" aria-hidden="true">
              <strong>{styles[activeStyle].name}</strong>
              {styles[activeStyle].guidance}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
