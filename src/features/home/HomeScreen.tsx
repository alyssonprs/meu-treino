import {
  CalendarCheck2,
  Download,
  FileInput,
  Play,
  ShieldCheck,
} from "lucide-react";
import modelJsonUrl from "@/assets/meu-treino-modelo.json?url";
import { Button } from "@/components/ui/button";
import { ImportPanel } from "@/features/import-export/ImportPanel";
import type { ImportStatus } from "@/features/import-export/importStatus";
import { LoadHistoryPanel } from "@/features/progress/LoadHistoryPanel";
import type {
  CycleProgressSummary,
  ExerciseLoadSummary,
} from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";
import { getRecommendationReasonLabel } from "@/features/workouts/workoutFormatters";

type HomeScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  cycleProgress: CycleProgressSummary | null;
  importStatus: ImportStatus;
  isLoadingActivePlan: boolean;
  loadSummaries: ExerciseLoadSummary[];
  nextRecommendation: NextRoutineRecommendation | null;
  workoutMessage: string | null;
  onActivatePlan: () => void;
  onChooseImportFile: () => void;
  onResetImport: () => void;
  onStartRecommendedWorkout: () => void;
};

export function HomeScreen({
  activePlan,
  cycleProgress,
  importStatus,
  isLoadingActivePlan,
  loadSummaries,
  nextRecommendation,
  workoutMessage,
  onActivatePlan,
  onChooseImportFile,
  onResetImport,
  onStartRecommendedWorkout,
}: HomeScreenProps) {
  const hasActivePlan = Boolean(activePlan);

  return (
    <>
      <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-info">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Offline pronto
        </div>
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            {hasActivePlan ? "Plano ativo" : "Nenhum plano ativo"}
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            {isLoadingActivePlan
              ? "Carregando seu treino"
              : activePlan?.plan.name ?? "Importe seu treino para comecar"}
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            {isLoadingActivePlan
              ? "Buscando os dados salvos neste dispositivo."
              : activePlan
                ? `${activePlan.plan.objective} - ${activePlan.routines.length} rotinas`
                : "O app guarda treino, cargas e progresso no proprio dispositivo."}
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <Button
            className="h-14 justify-start gap-3 text-base"
            onClick={onChooseImportFile}
            type="button"
          >
            <FileInput className="h-5 w-5" aria-hidden="true" />
            Importar JSON
          </Button>
          <Button
            asChild
            className="h-14 justify-start gap-3 text-base"
            variant="secondary"
          >
            <a download="meu-treino-modelo.json" href={modelJsonUrl}>
              <Download className="h-5 w-5" aria-hidden="true" />
              Baixar modelo
            </a>
          </Button>
        </div>
      </section>

      <ImportPanel
        importStatus={importStatus}
        onActivatePlan={onActivatePlan}
        onChooseAnotherFile={onChooseImportFile}
        onReset={onResetImport}
      />

      {activePlan && nextRecommendation ? (
        <section className="mt-5 rounded-lg border border-info bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
              <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-info">Proximo treino</p>
              <h3 className="truncate text-xl font-semibold">
                {nextRecommendation.routineName}
              </h3>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Ordem</p>
              <p className="mt-1 text-sm font-semibold">
                {nextRecommendation.routineOrder} de {activePlan.routines.length}
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Ciclo</p>
              <p className="mt-1 text-sm font-semibold">
                {cycleProgress?.completedSessions ?? 0} de{" "}
                {cycleProgress?.plannedSessions ?? 0}
              </p>
            </div>
          </div>

          {cycleProgress ? (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${cycleProgress.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {cycleProgress.isComplete
                  ? "Meta de treinos do ciclo atingida."
                  : `${cycleProgress.remainingSessions} treinos restantes no ciclo.`}
              </p>
            </div>
          ) : null}

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {getRecommendationReasonLabel(nextRecommendation.reason)}
          </p>

          {cycleProgress?.isComplete ? (
            <p className="mt-3 rounded-md border border-info bg-muted p-3 text-sm leading-6">
              Ciclo concluido. Baixe o modelo e gere um novo treino.
            </p>
          ) : null}

          <Button
            className="mt-4 h-14 w-full justify-start gap-3 text-base"
            onClick={onStartRecommendedWorkout}
            type="button"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            Iniciar treino
          </Button>
        </section>
      ) : null}

      {workoutMessage ? (
        <p className="mt-5 rounded-lg border border-info bg-card p-4 text-sm leading-6">
          {workoutMessage}
        </p>
      ) : null}

      <LoadHistoryPanel summaries={loadSummaries} />
    </>
  );
}

