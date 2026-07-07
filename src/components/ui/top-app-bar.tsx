import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface TopAppBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  actions?: React.ReactNode;
  navigationIcon?: React.ReactNode;
  title: React.ReactNode;
}

const TopAppBar = React.forwardRef<HTMLElement, TopAppBarProps>(
  ({ actions, className, navigationIcon, title, ...props }, ref) => (
    <header
      className={cn(
        "flex min-h-16 items-center gap-2 bg-md-surface px-4 text-md-on-surface",
        className,
      )}
      ref={ref}
      {...props}
    >
      {navigationIcon ? (
        <div className="-ml-2 flex h-12 w-12 items-center justify-center">
          {navigationIcon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1 truncate text-title-lg font-regular">
        {title}
      </div>
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </header>
  ),
);
TopAppBar.displayName = "TopAppBar";

export { TopAppBar };
