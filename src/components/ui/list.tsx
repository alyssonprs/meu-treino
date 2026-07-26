import * as React from "react";
import { cn } from "@/components/ui/utils";

export const listItemClassName =
  "relative flex w-full items-center gap-3 text-md-on-surface";

export const listRowClassName =
  `${listItemClassName} text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary active:bg-md-on-surface/[var(--md-sys-state-pressed-opacity)]`;

export const listCurrentRowClassName = "bg-md-secondary-container/40";

export const listStatusClassName = {
  completed: "text-md-primary",
  "in-progress": "text-md-secondary",
  pending: "text-md-on-surface-variant",
} as const;

export const ListSurface = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "overflow-hidden rounded-xl border border-md-outline-variant bg-md-surface-container text-md-on-surface",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ListSurface.displayName = "ListSurface";
