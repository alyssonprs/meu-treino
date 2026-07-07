import * as React from "react";
import { cn } from "@/components/ui/utils";

const NavigationBar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    className={cn(
      "flex min-h-20 items-center justify-around gap-1 bg-md-surface-container px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-md-on-surface",
      className,
    )}
    ref={ref}
    {...props}
  />
));
NavigationBar.displayName = "NavigationBar";

export interface NavigationBarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

const NavigationBarItem = React.forwardRef<
  HTMLButtonElement,
  NavigationBarItemProps
>(({ active = false, className, icon, label, type = "button", ...props }, ref) => (
  <button
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex min-h-16 min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-label-md font-medium text-md-on-surface-variant transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
      "hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
      active && "text-md-on-secondary-container",
      className,
    )}
    ref={ref}
    type={type}
    {...props}
  >
    <span
      className={cn(
        "flex h-8 min-w-16 items-center justify-center rounded-full px-5 transition-colors",
        active && "bg-md-secondary-container",
      )}
    >
      {icon}
    </span>
    <span className="max-w-full truncate">{label}</span>
  </button>
));
NavigationBarItem.displayName = "NavigationBarItem";

export { NavigationBar, NavigationBarItem };
