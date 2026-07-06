import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/ui/utils";

const chipVariants = cva(
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-sm px-3 text-label-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
  {
    variants: {
      variant: {
        assist:
          "border border-md-outline bg-transparent text-md-on-surface hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
        filter:
          "border border-md-outline bg-transparent text-md-on-surface-variant hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
        selected:
          "border border-md-secondary-container bg-md-secondary-container text-md-on-secondary-container",
        input:
          "border border-md-outline bg-transparent text-md-on-surface hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
        suggestion:
          "bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-container-highest",
      },
    },
    defaultVariants: {
      variant: "assist",
    },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  as?: "button" | "span";
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ as = "button", className, disabled, type = "button", variant, ...props }, ref) => {
    if (as === "span") {
      return (
        <span
          className={cn(
            chipVariants({ variant, className }),
            disabled && "opacity-[var(--md-sys-state-disabled-opacity)]",
          )}
          {...(props as React.HTMLAttributes<HTMLSpanElement>)}
        />
      );
    }

    return (
      <button
        className={cn(chipVariants({ variant, className }))}
        disabled={disabled}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
