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
  info: "border-info/50 bg-info/10 text-info",
  success: "border-primary/50 bg-primary/10 text-primary",
  warning: "border-warning/60 bg-warning/10 text-warning",
  danger: "border-destructive/70 bg-destructive/10 text-destructive",
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
        "rounded-md border p-3 text-sm leading-6",
        toneClasses[tone],
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 text-foreground">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={title ? "mt-1 text-muted-foreground" : ""}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
