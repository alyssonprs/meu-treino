import * as React from "react";
import { cn } from "@/components/ui/utils";

const NavigationBar = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    className={cn(
      "flex min-h-[4.25rem] items-center justify-around gap-1 rounded-xl border border-md-outline-variant bg-md-surface-container/85 px-2 py-2 text-md-on-surface shadow-md-2 backdrop-blur-md",
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
      "flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-label-md font-medium text-md-on-surface-variant transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-primary disabled:pointer-events-none disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
      "hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
      active && "bg-md-secondary-container/70 text-md-on-secondary-container",
      className,
    )}
    ref={ref}
    type={type}
    {...props}
  >
    <span
      className={cn(
        "flex h-7 items-center justify-center transition-colors",
      )}
    >
      {icon}
    </span>
    <span className="max-w-full truncate">{label}</span>
  </button>
));
NavigationBarItem.displayName = "NavigationBarItem";

export { NavigationBar, NavigationBarItem };
