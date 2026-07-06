import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, disabled, label, ...props }, ref) => (
    <label
      className={cn(
        "inline-flex min-h-12 items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        className="peer sr-only"
        disabled={disabled}
        ref={ref}
        role="switch"
        type="checkbox"
        {...props}
      />
      <span
        className={cn(
          "relative h-8 w-[3.25rem] rounded-full border-2 border-md-outline bg-md-surface-container-highest transition-colors",
          "after:absolute after:left-1 after:top-1/2 after:h-4 after:w-4 after:-translate-y-1/2 after:rounded-full after:bg-md-outline after:transition-all after:content-['']",
          "peer-checked:border-md-primary peer-checked:bg-md-primary peer-checked:after:left-6 peer-checked:after:h-6 peer-checked:after:w-6 peer-checked:after:bg-md-on-primary",
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
        )}
        aria-hidden="true"
      />
      {label ? (
        <span
          className={cn(
            "text-body-lg text-md-on-surface",
            disabled && "opacity-[var(--md-sys-state-disabled-opacity)]",
          )}
        >
          {label}
        </span>
      ) : null}
    </label>
  ),
);
Switch.displayName = "Switch";

export { Switch };
