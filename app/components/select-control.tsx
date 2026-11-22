import type { ChangeEventHandler } from "react";

interface SelectControlProps {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  hideLabel?: boolean;
}

export function SelectControl({ id, label, options, value, onChange, hideLabel }: SelectControlProps) {
  return (
    <div className="select-control">
      <label className={hideLabel ? "sr-only" : "control-label"} htmlFor={id}>{label}</label>
      <div className="select-shell">
        <select id={id} value={value} onChange={onChange}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
    </div>
  );
}
