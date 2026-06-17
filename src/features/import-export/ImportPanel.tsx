import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileInput,
  type LucideIcon,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkoutPlanPreview } from "@/services/workoutImportService";
import type { ImportStatus } from "./importStatus";

type ImportPanelProps = {
  importStatus: ImportStatus;
  onActivatePlan: () => void;
  onChooseAnotherFile: () => void;
  onReset: () => void;
};

export function ImportPanel({
  importStatus,
  onActivatePlan,
  onChooseAnotherFile,
  onReset,
}: ImportPanelProps) {
  if (importStatus.state === "idle") {
    return (
      <section className="mt-5 grid gap-3">
        <InfoItem
          description="Escolha um arquivo local. A validacao acontece antes de salvar."
          icon={FileInput}
          title="Importar treino"
        />
        <InfoItem
          description="Use o arquivo base para pedir um novo plano compativel."
          icon={Download}
          title="Baixar modelo"
        />
      </section>
    );
  }

  if (importStatus.state === "error") {
    return (
      <section className="mt-5 rounded-lg border border-destructive bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-medium">JSON nao importado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {importStatus.fileName ?? "Arquivo selecionado"}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {importStatus.errors.slice(0, 4).map((error) => (
            <li
              className="text-sm leading-6"
              key={`${error.path}-${error.message}`}
            >
              <span className="font-medium">{error.path}:</span>{" "}
              <span className="text-muted-foreground">{error.message}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-5 h-12 w-full gap-2"
          onClick={onChooseAnotherFile}
          type="button"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Tentar outro arquivo
        </Button>
      </section>
    );
  }

  const isSaving = importStatus.state === "saving";
  const isSaved = importStatus.state === "saved";

  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          {isSaved ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <FileInput className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{importStatus.fileName}</p>
          <h2 className="mt-1 font-medium">
            {isSaved ? "Plano ativo atualizado" : "Preview do treino"}
          </h2>
        </div>
      </div>
      <PreviewSummary preview={importStatus.preview} />
      <div className="mt-5 grid gap-2">
        {!isSaved ? (
          <Button
            className="h-12 w-full gap-2"
            disabled={isSaving}
            onClick={onActivatePlan}
            type="button"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            {isSaving ? "Ativando..." : "Ativar novo plano"}
          </Button>
        ) : null}
        <Button
          className="h-12 w-full gap-2"
          onClick={isSaved ? onReset : onChooseAnotherFile}
          type="button"
          variant="secondary"
        >
          {isSaved ? "Fechar preview" : "Escolher outro JSON"}
        </Button>
      </div>
    </section>
  );
}

function PreviewSummary({ preview }: { preview: WorkoutPlanPreview }) {
  const summaryItems = [
    ["Objetivo", preview.objective],
    ["Nivel", preview.level],
    ["Duracao", `${preview.estimatedDurationWeeks} semanas`],
    ["Frequencia", `${preview.daysPerWeek} dias/semana`],
    ["Rotinas", String(preview.routineCount)],
    ["Exercicios", String(preview.exerciseCount)],
  ];

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold leading-tight">{preview.name}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        {summaryItems.map(([label, value]) => (
          <div className="rounded-md bg-muted p-3" key={label}>
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Ao ativar, o progresso da sequencia atual e reiniciado. Historicos de
        carga ja salvos permanecem no dispositivo.
      </p>
    </div>
  );
}

type InfoItemProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

function InfoItem({ description, icon: Icon, title }: InfoItemProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
