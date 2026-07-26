import {
  CalendarCheck2,
  CheckCircle2,
  Dumbbell,
  History,
  Home,
  Repeat2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinearProgress } from "@/components/ui/progress";
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
      <Card className="border-md-primary" padding="lg" variant="outlined">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-md-primary-container text-md-on-primary-container">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-md-primary">
              Sessão salva
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {completion.routineName}
            </h2>
            <p className="mt-2 text-body-md leading-6 text-md-on-surface-variant">
              Sessão salva neste dispositivo.
            </p>
          </div>
        </div>
      </Card>

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
        <Card padding="sm" variant="filled">
          <p className={`text-label-lg font-medium ${getHealthConnectExportToneClass(completion.healthConnectExport.status)}`}>
            Health Connect
          </p>
          <p className="mt-1 text-body-md leading-6 text-md-on-surface-variant">
            {completion.healthConnectExport.message}
          </p>
        </Card>
      ) : null}

      <Card variant="outlined">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-label-lg font-medium text-md-secondary">Progresso do ciclo</p>
            <h3 className="mt-1 text-xl font-semibold">
              {cycleProgress
                ? `${cycleProgress.completedSessions} de ${cycleProgress.plannedSessions}`
                : "Atualizado"}
            </h3>
          </div>
          {cycleProgress ? (
            <span className="rounded-md bg-md-surface-container-high px-2 py-1 text-label-lg font-medium tabular-nums">
              {cycleProgress.percentage}%
            </span>
          ) : null}
        </div>

        {cycleProgress ? (
          <>
            <LinearProgress
              aria-label="Progresso do ciclo"
              className="mt-4 h-2"
              value={cycleProgress.percentage}
            />
            <p className="mt-3 text-body-md leading-6 text-md-on-surface-variant">
              {cycleProgress.isComplete
                ? "Ciclo concluído. Baixe o modelo e gere um novo treino."
                : `${cycleProgress.remainingSessions} treinos restantes neste ciclo.`}
            </p>
          </>
        ) : null}
      </Card>

      <Card variant="outlined">
        <p className="flex items-center gap-2 text-label-lg font-medium text-md-secondary">
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          Próxima recomendação
        </p>
        <h3 className="mt-2 text-xl font-semibold">
          {nextRecommendation?.routineName ?? "Treino atualizado"}
        </h3>
        <p className="mt-2 text-body-md leading-6 text-md-on-surface-variant">
          A tela inicial já vai abrir com a próxima rotina pela ordem do plano.
        </p>
      </Card>

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

function getHealthConnectExportToneClass(
  status: WorkoutHealthConnectExport["status"],
) {
  if (status === "exported") {
    return "text-md-primary";
  }

  if (status === "failed" || status === "permission-missing") {
    return "text-md-tertiary";
  }

  return "text-md-secondary";
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
    <Card variant="outlined">
      <Icon className="h-5 w-5 text-md-secondary" aria-hidden="true" />
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-body-md text-md-on-surface-variant">{label}</p>
    </Card>
  );
}
