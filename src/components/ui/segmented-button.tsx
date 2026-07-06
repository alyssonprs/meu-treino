import * as React from "react";
import { cn } from "@/components/ui/utils";

export type SegmentedButtonOption<TValue extends string> = {
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  value: TValue;
};

export type SegmentedButtonProps<TValue extends string> = {
  "aria-label": string;
  className?: string;
  disabled?: boolean;
  name: string;
  onValueChange: (value: TValue) => void;
  options: Array<SegmentedButtonOption<TValue>>;
  value: TValue;
};

export function SegmentedButton<TValue extends string>({
  "aria-label": ariaLabel,
  className,
  disabled,
  name,
  onValueChange,
  options,
  value,
}: SegmentedButtonProps<TValue>) {
  return (
    <fieldset
      aria-label={ariaLabel}
      className={cn(
        "inline-grid min-h-10 grid-flow-col overflow-hidden rounded-full border border-md-outline",
        className,
      )}
      disabled={disabled}
    >
      <legend className="sr-only">{ariaLabel}</legend>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <label
            className={cn(
              "relative -ml-px first:ml-0",
              disabled || option.disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
            key={option.value}
          >
            <input
              checked={isSelected}
              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={disabled || option.disabled}
              name={name}
              onChange={() => onValueChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span
              className={cn(
                "pointer-events-none flex min-h-10 min-w-12 items-center justify-center gap-2 border-l border-md-outline px-4 text-label-lg font-medium text-md-on-surface transition-colors first:border-l-0",
                "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-ring",
                "peer-disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
                isSelected
                  ? "bg-md-secondary-container text-md-on-secondary-container"
                  : "bg-transparent hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
              )}
            >
              {option.icon}
              {option.label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
