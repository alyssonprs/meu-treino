import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Pause,
  Play,
  Plus,
  Save,
  Square,
  TimerReset,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getNextPendingSetIndex,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import type { ExerciseLoadHistoryRecord } from "@/storage/workoutPlanRepository";
import { formatLoad, formatTimer } from "./workoutFormatters";

type EditableSetField = keyof Pick<
  WorkoutSetDraft,
  "loadKg" | "reps" | "rir" | "notes"
>;

type ActiveWorkoutScreenProps = {
  draft: WorkoutSessionDraft;
  loadHistoryByExerciseId: Map<string, ExerciseLoadHistoryRecord>;
  message: string | null;
  onBackToDetail: () => void;
  onCancel: () => void;
  onFinish: () => void;
  onSaveSet: (input: {
    exerciseIndex: number;
    setIndex: number;
    values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  }) => void;
  onSelectExercise: (exerciseIndex: number) => void;
  onUpdateSet: (input: {
    exerciseIndex: number;
    setIndex: number;
    field: EditableSetField;
    value: string;
  }) => void;
};

type RestState = {
  remainingSeconds: number;
};

export function ActiveWorkoutScreen({
  draft,
  loadHistoryByExerciseId,
  message,
  onBackToDetail,
  onCancel,
  onFinish,
  onSaveSet,
  onSelectExercise,
  onUpdateSet,
}: ActiveWorkoutScreenProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [restState, setRestState] = useState<RestState | null>(null);
  const currentExerciseIndex = draft.currentExerciseIndex;
  const currentExercise = draft.routine.exercises[currentExerciseIndex];
  const currentExerciseDraft = draft.exercises[currentExerciseIndex];
  const currentSetIndex = getNextPendingSetIndex(draft, currentExerciseIndex);
  const currentSet =
    currentSetIndex === null ? null : currentExerciseDraft?.sets[currentSetIndex];
  const registeredExercises = draft.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.completedAt !== null),
  ).length;
  const loadHistory = currentExercise
    ? loadHistoryByExerciseId.get(currentExercise.exerciseId)
    : undefined;
  const nextExerciseIndex = getNextExerciseIndex(draft, currentExerciseIndex);
  const isCurrentExerciseRegistered = currentSetIndex === null;

  const [setValues, setSetValues] = useState<
    Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">
  >({
    loadKg: currentSet?.loadKg ?? "",
    reps: currentSet?.reps ?? "",
    rir: currentSet?.rir ?? "",
    notes: currentSet?.notes ?? "",
  });

  useEffect(() => {
    setSetValues({
      loadKg: currentSet?.loadKg ?? "",
      reps: currentSet?.reps ?? "",
      rir: currentSet?.rir ?? "",
      notes: currentSet?.notes ?? "",
    });
  }, [currentExerciseIndex, currentSetIndex, currentSet]);

  useEffect(() => {
    if (!restState || restState.remainingSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRestState((current) =>
        current
          ? {
              ...current,
              remainingSeconds: Math.max(0, current.remainingSeconds - 1),
            }
          : current,
      );
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [restState]);

  if (!currentExercise || !currentExerciseDraft) {
    return (
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">Treino indisponível</h2>
        <Button className="mt-4 w-full" onClick={onBackToDetail} type="button">
          Voltar para lista
        </Button>
      </section>
    );
  }

  const canSaveSet =
    currentSetIndex !== null &&
    setValues.loadKg.trim() !== "" &&
    setValues.reps.trim() !== "";

  function updateSetValue(field: EditableSetField, value: string) {
    if (currentSetIndex === null) {
      return;
    }

    setSetValues((current) => ({ ...current, [field]: value }));
    onUpdateSet({
      exerciseIndex: currentExerciseIndex,
      setIndex: currentSetIndex,
      field,
      value,
    });
  }

  function incrementField(field: "loadKg" | "reps", amount: number) {
    const currentValue = Number(setValues[field].replace(",", ".") || "0");
    const nextValue = Math.max(0, currentValue + amount);
    const formattedValue =
      field === "loadKg" && !Number.isInteger(nextValue)
        ? nextValue.toFixed(1)
        : String(nextValue);

    updateSetValue(field, formattedValue);
  }

  function saveCurrentExercise() {
    if (!canSaveSet || currentSetIndex === null) {
      return;
    }

    onSaveSet({
      exerciseIndex: currentExerciseIndex,
      setIndex: currentSetIndex,
      values: {
        ...setValues,
        rir: "",
      },
    });
    setRestState({
      remainingSeconds: currentExercise.rest_seconds ?? 90,
    });
  }

  function startNextStep() {
    setRestState(null);

    if (isCurrentExerciseRegistered && nextExerciseIndex !== null) {
      onSelectExercise(nextExerciseIndex);
    }
  }

  return (
    <section className="min-h-screen space-y-4 pt-2">
      <header className="flex items-center justify-between gap-2">
        <Button
          aria-label="Voltar para lista de exercicios"
          className="h-11 w-11 shrink-0 p-0"
          onClick={onBackToDetail}
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {draft.routine.name}
          </p>
          <h2 className="truncate text-lg font-semibold">Treino em andamento</h2>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            aria-label={isPaused ? "Retomar treino" : "Pausar treino"}
            className="h-11 w-11 p-0"
            onClick={() => setIsPaused((current) => !current)}
            type="button"
            variant="secondary"
          >
            {isPaused ? (
              <Play className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Pause className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
          <Button
            aria-label="Parar treino"
            className="h-11 w-11 p-0"
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <article className="rounded-lg border border-info bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-info">
              Exercício {currentExerciseIndex + 1} de {draft.exercises.length}
            </p>
            <h3 className="mt-1 text-2xl font-semibold">
              {currentExercise.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Meta: {currentExercise.sets}x {currentExercise.target_reps} -{" "}
              {currentExercise.rest_seconds ?? 90}s descanso
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium">
            {registeredExercises}/{draft.exercises.length}
          </span>
        </div>

        {loadHistory ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MetricCard
              label="Última carga"
              value={`${formatLoad(loadHistory.lastLoadKg)} kg x ${loadHistory.lastReps}`}
            />
            <MetricCard
              label="Maior carga"
              value={`${formatLoad(loadHistory.maxLoadKg)} kg`}
            />
          </div>
        ) : null}
      </article>

      {restState ? (
        <RestCard
          exerciseName={currentExercise.name}
          hasNextExercise={nextExerciseIndex !== null}
          isExerciseDone={isCurrentExerciseRegistered}
          restState={restState}
          onAddThirtySeconds={() =>
            setRestState((current) =>
              current
                ? {
                    ...current,
                    remainingSeconds: current.remainingSeconds + 30,
                  }
                : current,
            )
          }
          onSkip={() => setRestState(null)}
          onStartNext={startNextStep}
        />
      ) : isCurrentExerciseRegistered ? (
        <ExerciseDoneCard
          hasNextExercise={nextExerciseIndex !== null}
          onFinish={onFinish}
          onNextExercise={startNextStep}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-info">
                Exercício atual
              </p>
              <h3 className="mt-1 text-xl font-semibold">Registrar exercício</h3>
            </div>
            {isPaused ? (
              <span className="rounded-md border border-info px-2 py-1 text-xs font-medium text-info">
                Pausado
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <StepperInput
              label="Carga"
              suffix="kg"
              value={setValues.loadKg}
              onChange={(value) => updateSetValue("loadKg", value)}
              onDecrement={() => incrementField("loadKg", -2.5)}
              onIncrement={() => incrementField("loadKg", 2.5)}
            />
            <StepperInput
              label="Reps"
              value={setValues.reps}
              onChange={(value) => updateSetValue("reps", value)}
              onDecrement={() => incrementField("reps", -1)}
              onIncrement={() => incrementField("reps", 1)}
            />
          </div>

          {currentExercise.notes ? (
            <p className="mt-4 rounded-md bg-muted p-3 text-sm leading-6 text-muted-foreground">
              {currentExercise.notes}
            </p>
          ) : null}

          <Button
            className="mt-4 h-14 w-full gap-3 text-base"
            disabled={!canSaveSet || isPaused}
            onClick={saveCurrentExercise}
            type="button"
          >
            <Save className="h-5 w-5" aria-hidden="true" />
            Registrar exercício
          </Button>
        </div>
      )}

      {message ? (
        <p className="rounded-lg border border-destructive bg-card p-4 text-sm leading-6">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 pb-2">
        <Button
          className="h-12 gap-2"
          onClick={onBackToDetail}
          type="button"
          variant="secondary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Lista
        </Button>
        <Button className="h-12 gap-2" onClick={onFinish} type="button">
          <Square className="h-4 w-4" aria-hidden="true" />
          Finalizar
        </Button>
      </div>
    </section>
  );
}

function StepperInput({
  label,
  suffix,
  value,
  onChange,
  onDecrement,
  onIncrement,
}: {
  label: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="grid grid-cols-[3.25rem_1fr_3.25rem] items-center gap-3 rounded-lg border border-border bg-background p-3">
      <Button
        aria-label={`Diminuir ${label}`}
        className="h-12 w-12 p-0"
        onClick={onDecrement}
        type="button"
        variant="secondary"
      >
        <Minus className="h-5 w-5" aria-hidden="true" />
      </Button>
      <label className="min-w-0 text-center">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div className="mt-1 flex items-baseline justify-center gap-1">
          <input
            className="h-12 w-full min-w-0 bg-transparent text-center text-3xl font-semibold tabular-nums outline-none"
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value)}
            type="text"
            value={value}
          />
          {suffix ? (
            <span className="text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
      </label>
      <Button
        aria-label={`Aumentar ${label}`}
        className="h-12 w-12 p-0"
        onClick={onIncrement}
        type="button"
        variant="secondary"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

function RestCard({
  exerciseName,
  hasNextExercise,
  isExerciseDone,
  restState,
  onAddThirtySeconds,
  onSkip,
  onStartNext,
}: {
  exerciseName: string;
  hasNextExercise: boolean;
  isExerciseDone: boolean;
  restState: RestState;
  onAddThirtySeconds: () => void;
  onSkip: () => void;
  onStartNext: () => void;
}) {
  return (
    <div className="rounded-lg border border-info bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-info">
            <TimerReset className="h-4 w-4" aria-hidden="true" />
            Descanso após registro
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{exerciseName}</p>
        </div>
        <p className="text-4xl font-semibold tabular-nums">
          {formatTimer(restState.remainingSeconds)}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          className="h-12"
          onClick={onAddThirtySeconds}
          type="button"
          variant="secondary"
        >
          +30s
        </Button>
        <Button
          className="h-12"
          onClick={onSkip}
          type="button"
          variant="secondary"
        >
          Pular
        </Button>
        <Button className="h-12 gap-1 px-2" onClick={onStartNext} type="button">
          {isExerciseDone && hasNextExercise ? "Próximo" : "Concluir"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function ExerciseDoneCard({
  hasNextExercise,
  onFinish,
  onNextExercise,
}: {
  hasNextExercise: boolean;
  onFinish: () => void;
  onNextExercise: () => void;
}) {
  return (
    <div className="rounded-lg border border-primary bg-card p-4">
      <p className="text-sm font-medium text-primary">Exercício concluído</p>
      <h3 className="mt-1 text-xl font-semibold">
        Carga e repetições foram registradas.
      </h3>
      <Button
        className="mt-4 h-14 w-full gap-2 text-base"
        onClick={hasNextExercise ? onNextExercise : onFinish}
        type="button"
      >
        {hasNextExercise ? "Próximo exercício" : "Finalizar rotina"}
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function getNextExerciseIndex(
  draft: WorkoutSessionDraft,
  currentExerciseIndex: number,
) {
  const nextIndex = draft.exercises.findIndex(
    (exercise, exerciseIndex) =>
      exerciseIndex > currentExerciseIndex &&
      exercise.sets.some((set) => set.completedAt === null),
  );

  if (nextIndex >= 0) {
    return nextIndex;
  }

  const wrappedIndex = draft.exercises.findIndex(
    (exercise, exerciseIndex) =>
      exerciseIndex !== currentExerciseIndex &&
      exercise.sets.some((set) => set.completedAt === null),
  );

  return wrappedIndex >= 0 ? wrappedIndex : null;
}
