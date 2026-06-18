import { useEffect, useState } from "react";
import { Save, TimerReset, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExerciseLoadHistoryRecord } from "@/storage/workoutPlanRepository";
import type {
  WorkoutSessionDraft,
  WorkoutSetDraft,
} from "@/services/workoutSessionService";
import { formatLoad, formatTimer } from "./workoutFormatters";

type ActiveWorkoutScreenProps = {
  draft: WorkoutSessionDraft;
  loadHistoryByExerciseId: Map<string, ExerciseLoadHistoryRecord>;
  message: string | null;
  onCancel: () => void;
  onFinish: () => void;
  onUpdateSet: (input: {
    exerciseIndex: number;
    setIndex: number;
    field: keyof WorkoutSetDraft;
    value: string;
  }) => void;
};

export function ActiveWorkoutScreen({
  draft,
  loadHistoryByExerciseId,
  message,
  onCancel,
  onFinish,
  onUpdateSet,
}: ActiveWorkoutScreenProps) {
  const exerciseOrder = getExerciseDisplayOrder(
    draft.routine.exercises.length,
    draft.initialExerciseIndex,
  );

  return (
    <section className="mt-2 space-y-4">
      <div className="rounded-lg border border-info bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-info">Treino em andamento</p>
            <h2 className="mt-1 text-2xl font-semibold">{draft.routine.name}</h2>
          </div>
          <Button
            aria-label="Cancelar treino"
            className="h-11 w-11 shrink-0 p-0"
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {draft.routine.warmup.length > 0 ? (
          <div className="mt-4 rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TimerReset className="h-4 w-4 text-info" aria-hidden="true" />
              Aquecimento
            </div>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
              {draft.routine.warmup.map((step) => (
                <li key={step.id}>
                  {step.activity} - {step.duration_minutes} min
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {exerciseOrder.map((exerciseIndex, displayIndex) => {
        const exercise = draft.routine.exercises[exerciseIndex];
        const exerciseDraft = draft.exercises[exerciseIndex];
        const loadHistory = loadHistoryByExerciseId.get(exercise.exerciseId);

        return (
          <article
            className="rounded-lg border border-border bg-card p-4"
            key={exercise.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  {displayIndex === 0
                    ? "Exercicio escolhido"
                    : exercise.muscleGroup}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{exercise.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {exercise.sets}x {exercise.target_reps}
                  {typeof exercise.target_rir === "number"
                    ? ` - RIR ${exercise.target_rir}`
                    : ""}
                </p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                {exercise.rest_seconds ?? 90}s
              </span>
            </div>

            {loadHistory ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Ultima carga
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatLoad(loadHistory.lastLoadKg)} kg x{" "}
                    {loadHistory.lastReps}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Maior carga
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatLoad(loadHistory.maxLoadKg)} kg
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {exerciseDraft.sets.map((set, setIndex) => (
                <div
                  className="grid grid-cols-[2rem_1fr_1fr_1fr] items-end gap-2"
                  key={`${exercise.id}-${setIndex}`}
                >
                  <p className="pb-3 text-center text-sm font-semibold text-muted-foreground">
                    {setIndex + 1}
                  </p>
                  <SetInput
                    label="kg"
                    value={set.loadKg}
                    onChange={(value) =>
                      onUpdateSet({
                        exerciseIndex,
                        setIndex,
                        field: "loadKg",
                        value,
                      })
                    }
                  />
                  <SetInput
                    label="reps"
                    value={set.reps}
                    onChange={(value) =>
                      onUpdateSet({
                        exerciseIndex,
                        setIndex,
                        field: "reps",
                        value,
                      })
                    }
                  />
                  <SetInput
                    label="RIR"
                    value={set.rir}
                    onChange={(value) =>
                      onUpdateSet({
                        exerciseIndex,
                        setIndex,
                        field: "rir",
                        value,
                      })
                    }
                  />
                </div>
              ))}
            </div>

            {exercise.notes ? (
              <p className="mt-4 rounded-md bg-muted p-3 text-sm leading-6 text-muted-foreground">
                {exercise.notes}
              </p>
            ) : null}

            <RestTimer durationSeconds={exercise.rest_seconds ?? 90} />
          </article>
        );
      })}

      {draft.routine.cooldown.length > 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Volta a calma</h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
            {draft.routine.cooldown.map((step) => (
              <li key={step.id}>
                {step.activity} - {step.duration_minutes} min
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-destructive bg-card p-4 text-sm leading-6">
          {message}
        </p>
      ) : null}

      <Button
        className="sticky bottom-4 h-14 w-full gap-3 text-base shadow-lg shadow-background"
        onClick={onFinish}
        type="button"
      >
        <Save className="h-5 w-5" aria-hidden="true" />
        Finalizar treino
      </Button>
    </section>
  );
}

function getExerciseDisplayOrder(totalExercises: number, initialIndex: number) {
  if (
    totalExercises <= 0 ||
    initialIndex < 0 ||
    initialIndex >= totalExercises
  ) {
    return Array.from({ length: totalExercises }, (_, index) => index);
  }

  return [
    initialIndex,
    ...Array.from({ length: totalExercises }, (_, index) => index).filter(
      (index) => index !== initialIndex,
    ),
  ];
}

function RestTimer({ durationSeconds }: { durationSeconds: number }) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [remainingSeconds]);

  const isRunning = remainingSeconds > 0;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Descanso</p>
        <p className="mt-1 text-lg font-semibold tabular-nums">
          {formatTimer(isRunning ? remainingSeconds : durationSeconds)}
        </p>
      </div>
      <Button
        className="h-11 shrink-0 gap-2"
        onClick={() => setRemainingSeconds(durationSeconds)}
        type="button"
        variant={isRunning ? "secondary" : "default"}
      >
        <TimerReset className="h-4 w-4" aria-hidden="true" />
        {isRunning ? "Reiniciar" : "Iniciar"}
      </Button>
    </div>
  );
}

function SetInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-center text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        className="h-12 min-w-0 rounded-md border border-input bg-background px-2 text-center text-base font-semibold outline-none focus:border-ring"
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}
