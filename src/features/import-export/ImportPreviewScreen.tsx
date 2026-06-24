import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  FileInput,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImportStatus } from "./importStatus";

type ImportPreviewStatus = Extract<
  ImportStatus,
  { state: "preview" | "saving" }
>;

type ImportPreviewScreenProps = {
  importStatus: ImportPreviewStatus;
  onActivatePlan: () => void;
  onCancelImport: () => void;
  onChooseAnotherFile: () => void;
};

export function ImportPreviewScreen({
  importStatus,
  onActivatePlan,
  onCancelImport,
  onChooseAnotherFile,
}: ImportPreviewScreenProps) {
  const isSaving = importStatus.state === "saving";
  const preview = importStatus.preview;
  const summaryItems = [
    ["Objetivo", preview.objective],
    ["Nivel", preview.level],
    ["Duração", `${preview.estimatedDurationWeeks} semanas`],
    ["Frequencia", `${preview.daysPerWeek} dias/semana`],
    ["Rotinas", String(preview.routineCount)],
    ["Exercícios", String(preview.exerciseCount)],
  ];

  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          <FileInput className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{importStatus.fileName}</p>
          <h2 className="mt-1 text-2xl font-semibold">Preview do JSON</h2>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-semibold leading-tight">{preview.name}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {summaryItems.map(([label, value]) => (
            <div className="rounded-md bg-muted p-3" key={label}>
              <dt className="text-xs font-medium text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Ao confirmar, o progresso da sequência atual é reiniciado. Históricos
          de carga já salvos permanecem no dispositivo.
        </p>
        {preview.warnings.length > 0 ? (
          <div className="mt-4 rounded-md border border-warning/60 bg-warning/10 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  Avisos de qualidade
                </p>
                <ul className="mt-2 grid gap-2 text-muted-foreground">
                  {preview.warnings.map((warning) => (
                    <li key={warning.code}>
                      <p>{warning.message}</p>
                      <p className="mt-1 break-words text-xs">
                        IDs: {warning.visualIds.slice(0, 4).join(", ")}
                        {warning.visualIds.length > 4 ? "..." : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-2">
        <Button
          className="h-12 w-full gap-2"
          disabled={isSaving}
          onClick={onActivatePlan}
          type="button"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          {isSaving ? "Importando..." : "Confirmar importação"}
        </Button>
        <Button
          className="h-12 w-full gap-2"
          disabled={isSaving}
          onClick={onChooseAnotherFile}
          type="button"
          variant="secondary"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Escolher outro JSON
        </Button>
        <Button
          className="h-12 w-full gap-2"
          disabled={isSaving}
          onClick={onCancelImport}
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Voltar ao inicio
        </Button>
      </div>
    </section>
  );
}
