import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

type NoticeTone = "info" | "success" | "warning" | "danger";

type NoticeProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: NoticeTone;
};

const toneClasses: Record<NoticeTone, string> = {
  info: "border-md-secondary/50 bg-md-secondary-container text-md-on-secondary-container",
  success:
    "border-md-primary/50 bg-md-primary-container text-md-on-primary-container",
  warning:
    "border-md-tertiary/60 bg-md-tertiary-container text-md-on-tertiary-container",
  danger: "border-md-error/70 bg-md-error-container text-md-on-error-container",
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export function Notice({
  children,
  className,
  title,
  tone = "info",
}: NoticeProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-md border p-3 text-body-md",
        toneClasses[tone],
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 text-md-on-surface">
          {title ? <p className="font-medium">{title}</p> : null}
          <div className={title ? "mt-1 text-md-on-surface-variant" : ""}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
