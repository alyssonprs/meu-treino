import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  errorText?: string;
  helperText?: string;
  label: string;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { className, disabled, errorText, helperText, id, label, required, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const supportingText = errorText ?? helperText;
    const supportingTextId = supportingText ? `${inputId}-supporting-text` : undefined;

    return (
      <div className={cn("grid gap-1", className)}>
        <label
          className={cn(
            "text-label-md font-medium text-md-on-surface-variant",
            disabled && "opacity-[var(--md-sys-state-disabled-opacity)]",
            errorText && "text-md-error",
          )}
          htmlFor={inputId}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <input
          aria-describedby={supportingTextId}
          aria-invalid={errorText ? true : undefined}
          className={cn(
            "min-h-14 rounded-xs border border-md-outline bg-md-surface-container-lowest px-4 text-body-lg text-md-on-surface outline-none transition-colors placeholder:text-md-on-surface-variant focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 disabled:opacity-[var(--md-sys-state-disabled-opacity)]",
            errorText && "border-md-error focus:border-md-error focus:ring-md-error/20",
          )}
          disabled={disabled}
          id={inputId}
          ref={ref}
          required={required}
          {...props}
        />
        {supportingText ? (
          <p
            className={cn(
              "px-4 text-body-sm text-md-on-surface-variant",
              errorText && "text-md-error",
            )}
            id={supportingTextId}
          >
            {supportingText}
          </p>
        ) : null}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export { TextField };
