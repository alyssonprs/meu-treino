import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  TimerReset,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ExerciseLoadSummary } from "@/services/progressService";
import type { NextRoutineRecommendation } from "@/services/workoutRecommendationService";
import type {
  ActiveWorkoutPlanSnapshot,
  PlannedExerciseRecord,
  RoutineStepRecord,
} from "@/storage/workoutPlanRepository";
import { formatLoad, getRecommendationReasonLabel } from "./workoutFormatters";

type WorkoutScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  loadSummaries: ExerciseLoadSummary[];
  nextRecommendation: NextRoutineRecommendation | null;
  routine: ActiveWorkoutPlanSnapshot["routines"][number] | null;
  onBack: () => void;
  onStartExercise: (exerciseIndex: number) => void;
};

export function WorkoutScreen({
  activePlan,
  loadSummaries,
  nextRecommendation,
  routine,
  onBack,
  onStartExercise,
}: WorkoutScreenProps) {
  if (!activePlan) {
    return (
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-info">Treino</p>
        <h2 className="mt-2 text-2xl font-semibold">Nenhum plano ativo</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Importe um JSON na tela Início para liberar as rotinas do plano.
        </p>
      </section>
    );
  }

  if (!routine) {
    return (
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-info">Treino</p>
        <h2 className="mt-2 text-2xl font-semibold">Rotina indisponível</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          A rotina selecionada não foi encontrada no plano ativo.
        </p>
      </section>
    );
  }

  const loadSummaryByExerciseId = new Map(
    loadSummaries.map((summary) => [summary.exerciseId, summary]),
  );
  const isRecommended = routine.id === nextRecommendation?.routineId;

  return (
    <section className="mt-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          aria-label="Voltar para rotinas"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-info"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Treino</p>
          <h2 className="truncate text-xl font-semibold">{routine.name}</h2>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-info">Lista de exercícios</p>
        <h3 className="mt-2 text-2xl font-semibold">
          Toque no exercício disponível
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Se um aparelho estiver ocupado, escolha outro exercício da rotina.
          Cada item abre a execução diretamente naquele exercício.
        </p>
        {nextRecommendation && isRecommended ? (
          <p className="mt-3 text-sm font-medium text-info">
            {getRecommendationReasonLabel(nextRecommendation.reason)}
          </p>
        ) : null}
      </div>

      <RoutineSteps
        emptyLabel="Sem aquecimento cadastrado."
        icon={Flame}
        steps={routine.warmup}
        title="Aquecimento"
      />

      <div>
        <p className="mb-3 text-sm font-semibold text-info">
          Exercícios do treino
        </p>
        <div className="space-y-3">
          {routine.exercises.map((exercise, exerciseIndex) => (
            <ExerciseButton
              exercise={exercise}
              key={exercise.id}
              loadSummary={loadSummaryByExerciseId.get(exercise.exerciseId)}
              onClick={() => onStartExercise(exerciseIndex)}
            />
          ))}
        </div>
      </div>

      <RoutineSteps
        emptyLabel="Sem cooldown cadastrado."
        icon={TimerReset}
        steps={routine.cooldown}
        title="Cooldown"
      />

      <p className="rounded-lg border border-info bg-card p-4 text-center text-sm leading-6 text-info">
        Sem botão global: toque no exercício que você vai fazer agora.
      </p>
    </section>
  );
}

function RoutineSteps({
  emptyLabel,
  icon: Icon,
  steps,
  title,
}: {
  emptyLabel: string;
  icon: LucideIcon;
  steps: RoutineStepRecord[];
  title: string;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-info">{title}</p>
      <div className="rounded-lg border border-border bg-card p-4">
        {steps.length > 0 ? (
          <ul className="space-y-3">
            {steps.map((step) => (
              <li className="flex items-start gap-3" key={step.id}>
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-info"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-medium">{step.activity}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.duration_minutes} min
                    {step.notes ? ` · ${step.notes}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function ExerciseButton({
  exercise,
  loadSummary,
  onClick,
}: {
  exercise: PlannedExerciseRecord;
  loadSummary: ExerciseLoadSummary | undefined;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-24 w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left"
      onClick={onClick}
      type="button"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
        <Dumbbell className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-semibold">{exercise.name}</h3>
          <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            Abrir
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {exercise.sets}x {exercise.target_reps}
          {typeof exercise.target_rir === "number"
            ? ` · RIR alvo ${exercise.target_rir}`
            : ""}
        </p>
        <p className="mt-1 text-sm font-medium text-info">
          {loadSummary
            ? `Última carga: ${formatLoad(loadSummary.lastLoadKg)} kg`
            : "Sem carga anterior"}
        </p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  );
}
