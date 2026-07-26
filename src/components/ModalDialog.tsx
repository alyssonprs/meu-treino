import type { ReactNode, RefObject } from "react";
import { Dialog } from "@/components/ui/dialog";

type ModalDialogProps = {
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

export function ModalDialog({
  children,
  className,
  description,
  dismissible,
  initialFocusRef,
  isOpen,
  onClose,
  role,
  title,
}: ModalDialogProps) {
  return (
    <Dialog
      className={className}
      description={description}
      dismissible={dismissible}
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onClose={onClose}
      role={role}
      title={title}
    >
      {children}
    </Dialog>
  );
}
