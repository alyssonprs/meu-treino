import { Check, Copy, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import promptTemplateContent from "@/assets/prompt-treino-modelo.md?raw";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/platform/clipboard";

type PromptCopyButtonProps = {
  className?: string;
};

type CopyState = "idle" | "copied" | "error";

export function PromptCopyButton({ className }: PromptCopyButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const Icon = copyState === "copied" ? Check : Copy;

  useEffect(() => {
    if (copyState !== "copied") {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState("idle"), 2500);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  return (
    <div>
      <Button
        className={className}
        onClick={() => {
          void copyTextToClipboard(promptTemplateContent)
            .then(() => setCopyState("copied"))
            .catch(() => setCopyState("error"));
        }}
        type="button"
        variant="secondary"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {copyState === "copied" ? "Prompt copiado" : "Copiar prompt para IA"}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copyState === "copied" ? "Prompt copiado" : ""}
      </span>

      {copyState === "error" ? (
        <p
          aria-live="polite"
          className="mt-2 flex items-start gap-2 text-sm leading-6 text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Nao foi possivel copiar. Abra o app em HTTPS e tente novamente.
        </p>
      ) : null}
    </div>
  );
}
