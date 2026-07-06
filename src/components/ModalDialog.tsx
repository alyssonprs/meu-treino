import type { ReactNode, RefObject } from "react";
import { Dialog } from "@/components/ui/dialog";

type ModalDialogProps = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function ModalDialog({
  children,
  className,
  description,
  initialFocusRef,
  isOpen,
  onClose,
  title,
}: ModalDialogProps) {
  return (
    <Dialog
      className={className}
      description={description}
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      {children}
    </Dialog>
  );
}
