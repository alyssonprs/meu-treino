import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/components/ui/utils";

export type DialogProps = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  dismissible?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  title: string;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Dialog({
  children,
  className,
  description,
  dismissible = true,
  initialFocusRef,
  isOpen,
  onClose,
  role = "dialog",
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActiveElement = document.activeElement;
    const frameId = window.requestAnimationFrame(() => {
      const focusTarget =
        initialFocusRef?.current ??
        dialogRef.current?.querySelector<HTMLElement>(focusableSelector) ??
        dialogRef.current;

      focusTarget?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [initialFocusRef, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (dismissible) {
          onClose();
        }
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissible, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex touch-manipulation items-center justify-center overscroll-contain bg-md-scrim/50 px-4 py-6 backdrop-blur-sm"
      role={role}
    >
      {dismissible ? (
        <button
          aria-label="Fechar janela"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
          type="button"
        />
      ) : (
        <div className="absolute inset-0" aria-hidden="true" />
      )}
      <div
        className={cn(
          "relative max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl bg-md-surface-container-high p-6 text-md-on-surface shadow-md-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
          className,
        )}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div>
          <h3 className="text-headline-sm font-regular" id={titleId}>
            {title}
          </h3>
          {description ? (
            <div
              className="mt-3 text-body-md text-md-on-surface-variant"
              id={descriptionId}
            >
              {description}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
