import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/ui/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full text-label-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
  {
    variants: {
      variant: {
        filled:
          "bg-md-primary text-md-on-primary shadow-md-0 hover:bg-md-primary/90",
        tonal:
          "bg-md-secondary-container text-md-on-secondary-container shadow-md-0 hover:bg-md-secondary-container/85",
        outlined:
          "border border-md-outline bg-transparent text-md-primary hover:bg-md-primary/[var(--md-sys-state-hover-opacity)]",
        text: "bg-transparent text-md-primary hover:bg-md-primary/[var(--md-sys-state-hover-opacity)]",
        elevated:
          "bg-md-surface-container-low text-md-primary shadow-md-1 hover:bg-md-surface-container hover:shadow-md-2",
        icon: "rounded-full bg-transparent p-0 text-md-on-surface-variant hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
        default:
          "bg-md-primary text-md-on-primary shadow-md-0 hover:bg-md-primary/90",
        secondary:
          "bg-md-secondary-container text-md-on-secondary-container shadow-md-0 hover:bg-md-secondary-container/85",
        ghost:
          "bg-transparent text-md-on-surface hover:bg-md-on-surface/[var(--md-sys-state-hover-opacity)]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-7",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
