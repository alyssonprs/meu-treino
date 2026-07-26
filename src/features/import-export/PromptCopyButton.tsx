import { Copy } from "lucide-react";
import { useState } from "react";
import promptTemplateContent from "@/assets/prompt-treino-modelo.md?raw";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/platform/clipboard";

type PromptCopyButtonProps = {
  className?: string;
};

type CopyState = "idle" | "copied" | "error";

export function PromptCopyButton({ className }: PromptCopyButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

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
        <Copy className="h-5 w-5" aria-hidden="true" />
        Copiar prompt para IA
      </Button>
      <ConfirmationDialog
        confirmLabel="Entendi"
        isOpen={copyState !== "idle"}
        onConfirm={() => setCopyState("idle")}
        title={copyState === "copied" ? "Prompt copiado" : "Não foi possível copiar"}
        tone={copyState === "copied" ? "success" : "danger"}
      >
        {copyState === "copied"
          ? "Cole o conteúdo no seu agente de IA para gerar um plano compatível."
          : "Abra o app em HTTPS e tente novamente."}
      </ConfirmationDialog>
    </div>
  );
}
