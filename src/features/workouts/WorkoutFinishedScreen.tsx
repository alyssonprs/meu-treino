import {
  CalendarCheck2,
  CheckCircle2,
  Dumbbell,
  History,
  Home,
  Repeat2,
} from "lucide-react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import type { HealthConnectAutoExportResult } from "@/services/healthConnectExportService";
import type { CycleProgressSummary } from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";

type WorkoutHealthConnectExport =
  | HealthConnectAutoExportResult
  | {
      status: "pending";
      message: string;
    };

export type WorkoutCompletionSummary = {
  sessionId: string;
  completedAt: string;
  routineName: string;
  completedExercisesCount: number;
  completedRecordsCount: number;
  healthConnectExport?: WorkoutHealthConnectExport;
};

type WorkoutFinishedScreenProps = {
  completion: WorkoutCompletionSummary;
  cycleProgress: CycleProgressSummary | null;
  nextRecommendation: NextRoutineRecommendation | null;
  onGoHome: () => void;
  onGoToHistory: () => void;
};

export function WorkoutFinishedScreen({
  completion,
  cycleProgress,
  nextRecommendation,
  onGoHome,
  onGoToHistory,
}: WorkoutFinishedScreenProps) {
  return (
    <section className="mt-4 space-y-5">
      <div className="rounded-lg border border-primary bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">
              Treino concluído
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {completion.routineName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sessão salva neste dispositivo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryMetric
          icon={Dumbbell}
          label="Exercícios"
          value={String(completion.completedExercisesCount)}
        />
        <SummaryMetric
          icon={CalendarCheck2}
          label="Registros"
          value={String(completion.completedRecordsCount)}
        />
      </div>

      {completion.healthConnectExport ? (
        <Notice
          title="Health Connect"
          tone={getHealthConnectExportTone(completion.healthConnectExport.status)}
        >
          {completion.healthConnectExport.message}
        </Notice>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-info">Progresso do ciclo</p>
            <h3 className="mt-1 text-xl font-semibold">
              {cycleProgress
                ? `${cycleProgress.completedSessions} de ${cycleProgress.plannedSessions}`
                : "Atualizado"}
            </h3>
          </div>
          {cycleProgress ? (
            <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums">
              {cycleProgress.percentage}%
            </span>
          ) : null}
        </div>

        {cycleProgress ? (
          <>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${cycleProgress.percentage}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {cycleProgress.isComplete
                ? "Ciclo concluído. Baixe o modelo e gere um novo treino."
                : `${cycleProgress.remainingSessions} treinos restantes neste ciclo.`}
            </p>
          </>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-info">
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          Próxima recomendação
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          {nextRecommendation?.routineName ?? "Treino atualizado"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A tela inicial já vai abrir com a próxima rotina pela ordem do plano.
        </p>
      </div>

      <div className="grid gap-3">
        <Button className="h-14 gap-3 text-base" onClick={onGoHome} type="button">
          <Home className="h-5 w-5" aria-hidden="true" />
          Voltar ao início
        </Button>
        <Button
          className="h-14 gap-3 text-base"
          onClick={onGoToHistory}
          type="button"
          variant="secondary"
        >
          <History className="h-5 w-5" aria-hidden="true" />
          Ver histórico
        </Button>
      </div>
    </section>
  );
}

function getHealthConnectExportTone(
  status: WorkoutHealthConnectExport["status"],
) {
  if (status === "exported") {
    return "success";
  }

  if (status === "failed" || status === "permission-missing") {
    return "warning";
  }

  return "info";
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Dumbbell;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-info" aria-hidden="true" />
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
