import { ChevronRight, Dumbbell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { RoutineExecutionSummary } from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";
import { RoutineMetrics } from "@/features/workouts/RoutineMetrics";

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
      <section className="mt-4 space-y-5">
        <PageHeader
          icon={Dumbbell}
          label="Treino"
          title="Rotinas do plano"
          description="Escolha a rotina que fará hoje."
        />
        <Card padding="lg" variant="outlined">
          <h3 className="text-title-lg font-medium">Nenhum plano ativo</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Importe um JSON na tela Início para listar as rotinas do plano.
          </p>
        </Card>
      </section>
    );
  }

  const routines = [...activePlan.routines].sort(
    (left, right) => left.order - right.order,
  );
  const routineExecutionById = new Map(
    routineExecutionSummaries.map((summary) => [summary.routineId, summary]),
  );

  return (
    <section className="mt-4 space-y-5">
      <PageHeader
        icon={Dumbbell}
        label="Treino"
        title="Rotinas do plano"
        description={activePlan.plan.name}
      />
      <div className="space-y-3">
        {routines.map((routine) => {
          const isRecommended = routine.id === nextRecommendation?.routineId;
          const executionSummary = routineExecutionById.get(routine.id);

          return (
            <button
              className={[
                "w-full rounded-lg border bg-md-surface-container-lowest p-4 text-left text-md-on-surface transition-colors hover:bg-md-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isRecommended ? "border-md-primary shadow-md-1" : "border-md-outline-variant",
              ].join(" ")}
              key={routine.id}
              onClick={() => onOpenRoutine(routine.id)}
              type="button"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
                  <Dumbbell className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{routine.name}</h3>
                    {isRecommended ? (
                      <Chip as="span" variant="selected">
                        Recomendado
                      </Chip>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-medium text-md-secondary">
                    {getRoutineExecutionLabel(executionSummary)}
                  </p>
                </div>
                <ChevronRight
                  className="mt-3 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <RoutineMetrics className="mt-4" routine={routine} />
            </button>
          );
        })}
      </div>
    </section>
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
