import {
  AlertCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptCopyButton } from "./PromptCopyButton";
import type { ImportStatus } from "./importStatus";

type ImportErrorStatus = Extract<ImportStatus, { state: "error" }>;

type ImportErrorScreenProps = {
  importStatus: ImportErrorStatus;
  onCancelImport: () => void;
  onChooseAnotherFile: () => void;
};

export function ImportErrorScreen({
  importStatus,
  onCancelImport,
  onChooseAnotherFile,
}: ImportErrorScreenProps) {
  return (
    <>
      <section className="mt-6 rounded-lg border border-destructive bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {importStatus.fileName ?? "Arquivo selecionado"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">JSON não importado</h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        O arquivo não segue o modelo esperado pelo app. Confira o detalhe
        técnico abaixo, tente importar outro JSON ou copie o prompt para gerar
        um plano compatível.
      </p>

      <ul className="mt-4 space-y-2 rounded-md bg-muted p-3">
        {importStatus.errors.slice(0, 5).map((error) => (
          <li
            className="text-sm leading-6"
            key={`${error.path}-${error.message}`}
          >
            <span className="font-medium">{error.path}:</span>{" "}
            <span className="text-muted-foreground">{error.message}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-2">
        <Button
          className="h-12 w-full gap-2"
          onClick={onChooseAnotherFile}
          type="button"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Escolher outro arquivo
        </Button>
        <PromptCopyButton className="h-12 w-full gap-2" />
        <Button
          className="h-12 w-full gap-2"
          onClick={onCancelImport}
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Voltar ao inicio
        </Button>
      </div>
      </section>
    </>
  );
}
