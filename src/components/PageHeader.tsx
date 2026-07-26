import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  action?: ReactNode;
  description?: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

export function PageHeader({
  action,
  description,
  icon: Icon,
  label,
  title,
}: PageHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-label-lg font-medium text-md-secondary">{label}</p>
        <h2 className="mt-0.5 text-headline-sm font-medium text-md-on-surface">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-body-md text-md-on-surface-variant">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
