import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  "aria-label"?: string;
  max?: number;
  value?: number | null;
}

const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  ({ "aria-label": ariaLabel, className, max = 100, value, ...props }, ref) => {
    const isIndeterminate = value === null || value === undefined;
    const normalizedValue = isIndeterminate
      ? 0
      : Math.min(Math.max(value, 0), max);
    const percentage = max > 0 ? (normalizedValue / max) * 100 : 0;

    return (
      <div
        aria-label={ariaLabel}
        aria-valuemax={isIndeterminate ? undefined : max}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuenow={isIndeterminate ? undefined : normalizedValue}
        className={cn(
          "h-1 overflow-hidden rounded-full bg-md-secondary-container",
          className,
        )}
        ref={ref}
        role="progressbar"
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full bg-md-primary transition-[width,transform]",
            isIndeterminate && "w-1/2 animate-pulse",
          )}
          style={isIndeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>
    );
  },
);
LinearProgress.displayName = "LinearProgress";

export { LinearProgress };
