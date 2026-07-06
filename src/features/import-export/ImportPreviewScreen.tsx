import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  FileInput,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <>
      <Card className="mt-6" padding="lg" variant="outlined">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-md-primary-container text-md-on-primary-container">
            <FileInput className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-body-md text-md-on-surface-variant">{importStatus.fileName}</p>
            <h2 className="mt-1 text-headline-sm font-medium">Preview do JSON</h2>
          </div>
        </div>

        <div className="mt-5">
        <h3 className="text-xl font-semibold leading-tight">{preview.name}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {summaryItems.map(([label, value]) => (
            <div className="rounded-md bg-md-surface-container-high p-3" key={label}>
              <dt className="text-label-md font-medium text-md-on-surface-variant">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-body-md text-md-on-surface-variant">
          Ao confirmar, o progresso da sequência atual é reiniciado. Históricos
          de carga já salvos permanecem no dispositivo.
        </p>
        {preview.warnings.length > 0 ? (
          <div className="mt-4 rounded-md border border-md-tertiary/60 bg-md-tertiary-container p-3 text-body-md text-md-on-tertiary-container">
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-medium">
                  Avisos de qualidade
                </p>
                <ul className="mt-2 grid gap-2">
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
      </Card>
    </>
  );
}
