import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useRef, type ReactNode } from "react";
import { ModalDialog } from "@/components/ModalDialog";
import { Button } from "@/components/ui/button";

type ConfirmationTone = "info" | "success" | "warning" | "danger";

type ConfirmationDialogProps = {
  cancelLabel?: string;
  children: ReactNode;
  confirmLabel: string;
  isDestructive?: boolean;
  isOpen: boolean;
  isPending?: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  tone?: ConfirmationTone;
};

const toneIcon = {
  danger: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

const toneClass: Record<ConfirmationTone, string> = {
  danger: "bg-md-error-container text-md-on-error-container",
  info: "bg-md-secondary-container text-md-on-secondary-container",
  success: "bg-md-primary-container text-md-on-primary-container",
  warning: "bg-md-tertiary-container text-md-on-tertiary-container",
};

export function ConfirmationDialog({
  cancelLabel,
  children,
  confirmLabel,
  isDestructive = false,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  title,
  tone = "info",
}: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const Icon = toneIcon[tone];
  const handleCancel = onCancel ?? onConfirm;

  return (
    <ModalDialog
      dismissible={!isPending}
      initialFocusRef={cancelLabel ? cancelButtonRef : confirmButtonRef}
      isOpen={isOpen}
      onClose={handleCancel}
      role="alertdialog"
      title={title}
    >
      <div className="mt-4 flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClass[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 text-body-md leading-6 text-md-on-surface-variant">
          {children}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {cancelLabel ? (
          <Button
            className="h-12"
            disabled={isPending}
            onClick={handleCancel}
            ref={cancelButtonRef}
            type="button"
            variant="tonal"
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          className={[
            "h-12",
            !cancelLabel ? "col-span-2" : "",
            isDestructive
              ? "bg-md-error text-md-on-error hover:bg-md-error/90"
              : "",
          ].join(" ")}
          disabled={isPending}
          onClick={() => {
            if (!isPending) {
              onConfirm();
            }
          }}
          ref={confirmButtonRef}
          type="button"
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalDialog>
  );
}
