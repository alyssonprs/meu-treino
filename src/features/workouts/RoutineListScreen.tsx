import {
  CalendarCheck2,
  ChevronRight,
  Clock3,
  Dumbbell,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScreenIdentifier } from "@/components/ScreenIdentifier";
import type { RoutineExecutionSummary } from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

type RoutineListScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  nextRecommendation: NextRoutineRecommendation | null;
  routineExecutionSummaries: RoutineExecutionSummary[];
  onOpenRoutine: (routineId: string) => void;
};

export function RoutineListScreen({
  activePlan,
  nextRecommendation,
  routineExecutionSummaries,
  onOpenRoutine,
}: RoutineListScreenProps) {
  if (!activePlan) {
    return (
      <>
        <ScreenIdentifier code="UX-0002" className="mt-2" />
        <section className="mt-6 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-info">Treino</p>
          <h2 className="mt-2 text-2xl font-semibold">Nenhum plano ativo</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Importe um JSON na tela Início para listar as rotinas do plano.
          </p>
        </section>
      </>
    );
  }

  const routines = [...activePlan.routines].sort(
    (left, right) => left.order - right.order,
  );
  const routineExecutionById = new Map(
    routineExecutionSummaries.map((summary) => [summary.routineId, summary]),
  );

  return (
    <section className="mt-4">
      <ScreenIdentifier code="UX-0002" />
      <div className="space-y-3">
        {routines.map((routine) => {
          const isRecommended = routine.id === nextRecommendation?.routineId;
          const executionSummary = routineExecutionById.get(routine.id);

          return (
            <button
              className={[
                "w-full rounded-lg border bg-card p-4 text-left",
                isRecommended ? "border-primary shadow-sm" : "border-border",
              ].join(" ")}
              key={routine.id}
              onClick={() => onOpenRoutine(routine.id)}
              type="button"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
                  <Dumbbell className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{routine.name}</h3>
                    {isRecommended ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        Recomendado
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-medium text-info">
                    {getRoutineExecutionLabel(executionSummary)}
                  </p>
                </div>
                <ChevronRight
                  className="mt-3 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3">
                <RoutineMetric
                  icon={Clock3}
                  value={`${getEstimatedRoutineDuration(routine)} min`}
                />
                <RoutineMetric
                  icon={CalendarCheck2}
                  value={`${routine.exercises.length} exercícios`}
                />
                <RoutineMetric
                  icon={RefreshCw}
                  value={getRoutineRestRangeLabel(routine)}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoutineMetric({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: string;
}) {
  return (
    <div className="min-w-0 text-center">
      <Icon className="mx-auto h-5 w-5 text-info" aria-hidden="true" />
      <p className="mt-2 truncate text-sm font-semibold leading-5">{value}</p>
    </div>
  );
}

function getRoutineExecutionLabel(
  summary: RoutineExecutionSummary | undefined,
) {
  if (!summary || !summary.lastCompletedAt) {
    return "Ainda não executada";
  }

  return `Última execução: ${formatShortDate(summary.lastCompletedAt)}`;
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function getEstimatedRoutineDuration(
  routine: ActiveWorkoutPlanSnapshot["routines"][number],
) {
  const warmupMinutes = routine.warmup.reduce(
    (total, step) => total + step.duration_minutes,
    0,
  );
  const cooldownMinutes = routine.cooldown.reduce(
    (total, step) => total + step.duration_minutes,
    0,
  );
  const exerciseMinutes = routine.exercises.reduce((total, exercise) => {
    const restMinutes = ((exercise.rest_seconds ?? 90) * exercise.sets) / 60;

    return total + restMinutes + exercise.sets * 1.5;
  }, 0);

  return Math.max(
    1,
    Math.round(warmupMinutes + cooldownMinutes + exerciseMinutes),
  );
}

function getRoutineRestRangeLabel(
  routine: ActiveWorkoutPlanSnapshot["routines"][number],
) {
  if (routine.exercises.length === 0) {
    return "0s";
  }

  const rests = routine.exercises.map((exercise) => exercise.rest_seconds ?? 90);
  const min = Math.min(...rests);
  const max = Math.max(...rests);

  return min === max ? `${min}s` : `${min}-${max}s`;
}

