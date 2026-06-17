import { CalendarCheck2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

type WorkoutScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  nextRecommendation: NextRoutineRecommendation | null;
  onStartRecommendedWorkout: () => void;
};

export function WorkoutScreen({
  activePlan,
  nextRecommendation,
  onStartRecommendedWorkout,
}: WorkoutScreenProps) {
  if (!activePlan || !nextRecommendation) {
    return (
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-info">Treino</p>
        <h2 className="mt-2 text-2xl font-semibold">Nenhum plano ativo</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Importe um JSON na tela Inicio para liberar o treino recomendado.
        </p>
      </section>
    );
  }

  const routine = activePlan.routines.find(
    (item) => item.id === nextRecommendation.routineId,
  );

  return (
    <section className="mt-6 rounded-lg border border-info bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-info">Treino recomendado</p>
          <h2 className="truncate text-2xl font-semibold">
            {nextRecommendation.routineName}
          </h2>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">Exercicios</p>
          <p className="mt-1 text-sm font-semibold">
            {routine?.exercises.length ?? 0}
          </p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">Ordem</p>
          <p className="mt-1 text-sm font-semibold">
            {nextRecommendation.routineOrder} de {activePlan.routines.length}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Esta aba ja esta ligada ao shell de navegacao. A proxima execucao vai
        transformar este conteudo no detalhe do treino aprovado.
      </p>

      <Button
        className="mt-4 h-14 w-full justify-start gap-3 text-base"
        onClick={onStartRecommendedWorkout}
        type="button"
      >
        <Play className="h-5 w-5" aria-hidden="true" />
        Iniciar treino
      </Button>
    </section>
  );
}

