import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Circle,
  Minus,
  Plus,
  Save,
  Square,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getNextPendingSetIndex,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import type { ExerciseLoadHistoryRecord } from "@/storage/workoutPlanRepository";
import { formatLoad, formatTimer } from "./workoutFormatters";

type EditableResultField = keyof Pick<
  WorkoutSetDraft,
  "loadKg" | "reps" | "rir" | "notes"
>;

type ActiveWorkoutScreenProps = {
  draft: WorkoutSessionDraft;
  loadHistoryByExerciseId: Map<string, ExerciseLoadHistoryRecord>;
  message: string | null;
  onBackToDetail: () => void;
  onFinish: () => void;
  onMarkSetCompleted: (input: {
    exerciseIndex: number;
    setIndex: number;
  }) => void;
  onSaveExerciseResult: (input: {
    exerciseIndex: number;
    values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  }) => void;
  onSelectExercise: (exerciseIndex: number) => void;
  onUpdateExerciseResult: (input: {
    exerciseIndex: number;
    field: EditableResultField;
    value: string;
  }) => void;
};

type RestState = {
  remainingSeconds: number;
  nextSetNumber: number;
};

export function ActiveWorkoutScreen({
  draft,
  loadHistoryByExerciseId,
  message,
  onBackToDetail,
  onFinish,
  onMarkSetCompleted,
  onSaveExerciseResult,
  onSelectExercise,
  onUpdateExerciseResult,
}: ActiveWorkoutScreenProps) {
  const [restState, setRestState] = useState<RestState | null>(null);
  const currentExerciseIndex = draft.currentExerciseIndex;
  const currentExercise = draft.routine.exercises[currentExerciseIndex];
  const currentExerciseDraft = draft.exercises[currentExerciseIndex];
  const currentSetIndex = getNextPendingSetIndex(draft, currentExerciseIndex);
  const completedSetsCount =
    currentExerciseDraft?.completedSets.filter((set) => set.completedAt !== null)
      .length ?? 0;
  const registeredExercises = draft.exercises.filter(
    (exercise) => exercise.result.completedAt !== null,
  ).length;
  const loadHistory = currentExercise
    ? loadHistoryByExerciseId.get(currentExercise.exerciseId)
    : undefined;
  const nextExerciseIndex = getNextExerciseIndex(draft, currentExerciseIndex);
  const isCurrentExerciseRegistered =
    currentExerciseDraft?.result.completedAt !== null;
  const areAllSetsCompleted =
    currentExerciseDraft !== undefined && currentSetIndex === null;

  const [resultValues, setResultValues] = useState<
    Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">
  >({
    loadKg: currentExerciseDraft?.result.loadKg ?? "",
    reps: currentExerciseDraft?.result.reps ?? "",
    rir: currentExerciseDraft?.result.rir ?? "",
    notes: currentExerciseDraft?.result.notes ?? "",
  });

  useEffect(() => {
    setRestState(null);
  }, [currentExerciseIndex]);

  useEffect(() => {
    setResultValues({
      loadKg: currentExerciseDraft?.result.loadKg ?? "",
      reps: currentExerciseDraft?.result.reps ?? "",
      rir: currentExerciseDraft?.result.rir ?? "",
      notes: currentExerciseDraft?.result.notes ?? "",
    });
  }, [
    currentExerciseDraft?.result.loadKg,
    currentExerciseDraft?.result.notes,
    currentExerciseDraft?.result.reps,
    currentExerciseDraft?.result.rir,
  ]);

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

  const canSaveResult =
    areAllSetsCompleted &&
    !isCurrentExerciseRegistered &&
    resultValues.loadKg.trim() !== "" &&
    resultValues.reps.trim() !== "";

  function updateResultValue(field: EditableResultField, value: string) {
    setResultValues((current) => ({ ...current, [field]: value }));
    onUpdateExerciseResult({
      exerciseIndex: currentExerciseIndex,
      field,
      value,
    });
  }

  function incrementField(field: "loadKg" | "reps", amount: number) {
    const currentValue = Number(resultValues[field].replace(",", ".") || "0");
    const nextValue = Math.max(0, currentValue + amount);
    const formattedValue =
      field === "loadKg" && !Number.isInteger(nextValue)
        ? nextValue.toFixed(1)
        : String(nextValue);

    updateResultValue(field, formattedValue);
  }

  function markCurrentSetCompleted() {
    if (currentSetIndex === null) {
      return;
    }

    onMarkSetCompleted({
      exerciseIndex: currentExerciseIndex,
      setIndex: currentSetIndex,
    });

    const nextSetIndex = currentSetIndex + 1;

    if (nextSetIndex < currentExerciseDraft.completedSets.length) {
      setRestState({
        remainingSeconds: currentExercise.rest_seconds ?? 90,
        nextSetNumber: nextSetIndex + 1,
      });
    }
  }

  function saveCurrentExerciseResult() {
    if (!canSaveResult) {
      return;
    }

    onSaveExerciseResult({
      exerciseIndex: currentExerciseIndex,
      values: {
        ...resultValues,
        rir: "",
      },
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
          aria-label="Voltar para lista de exercícios"
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
        <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium">
          {registeredExercises}/{draft.exercises.length}
        </span>
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
              Meta: {currentExercise.sets}x {currentExercise.target_reps} ·{" "}
              {currentExercise.rest_seconds ?? 90}s descanso
            </p>
          </div>
        </div>

        <div className="mt-4">
          <SetProgress
            completedSetsCount={completedSetsCount}
            totalSets={currentExerciseDraft.completedSets.length}
          />
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
        />
      ) : isCurrentExerciseRegistered ? (
        <ExerciseDoneCard
          hasNextExercise={nextExerciseIndex !== null}
          onFinish={onFinish}
          onNextExercise={startNextStep}
        />
      ) : areAllSetsCompleted ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium text-info">Exercício atual</p>
            <h3 className="mt-1 text-xl font-semibold">Registrar resultado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Informe carga e reps uma vez para este exercício.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <StepperInput
              label="Carga"
              suffix="kg"
              value={resultValues.loadKg}
              onChange={(value) => updateResultValue("loadKg", value)}
              onDecrement={() => incrementField("loadKg", -2.5)}
              onIncrement={() => incrementField("loadKg", 2.5)}
            />
            <StepperInput
              label="Reps"
              value={resultValues.reps}
              onChange={(value) => updateResultValue("reps", value)}
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
            disabled={!canSaveResult}
            onClick={saveCurrentExerciseResult}
            type="button"
          >
            <Save className="h-5 w-5" aria-hidden="true" />
            Concluir exercício
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-info">Série atual</p>
          <h3 className="mt-1 text-xl font-semibold">
            Série {(currentSetIndex ?? 0) + 1} de{" "}
            {currentExerciseDraft.completedSets.length}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Marque quando terminar a série. A carga e reps entram no fim do
            exercício.
          </p>
          <Button
            className="mt-4 h-14 w-full gap-3 text-base"
            onClick={markCurrentSetCompleted}
            type="button"
          >
            <Check className="h-5 w-5" aria-hidden="true" />
            Série concluída
          </Button>
        </div>
      )}

      {message ? (
        <p className="rounded-lg border border-destructive bg-card p-4 text-sm leading-6">
          {message}
        </p>
      ) : null}

      <ExerciseStatusList draft={draft} onSelectExercise={onSelectExercise} />

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
  restState,
  onAddThirtySeconds,
  onSkip,
}: {
  exerciseName: string;
  restState: RestState;
  onAddThirtySeconds: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="rounded-lg border border-info bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-info">
            <TimerReset className="h-4 w-4" aria-hidden="true" />
            Descanso após série
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {exerciseName} · próxima série {restState.nextSetNumber}
          </p>
        </div>
        <p className="text-4xl font-semibold tabular-nums">
          {formatTimer(restState.remainingSeconds)}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          className="h-12"
          onClick={onAddThirtySeconds}
          type="button"
          variant="secondary"
        >
          +30s
        </Button>
        <Button className="h-12" onClick={onSkip} type="button">
          Próxima série
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

function SetProgress({
  completedSetsCount,
  totalSets,
}: {
  completedSetsCount: number;
  totalSets: number;
}) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">Séries</p>
        <p className="text-sm font-semibold">
          {completedSetsCount}/{totalSets}
        </p>
      </div>
      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${totalSets}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalSets }, (_, index) => (
          <span
            className={
              index < completedSetsCount
                ? "h-2 rounded-full bg-primary"
                : "h-2 rounded-full bg-border"
            }
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseStatusList({
  draft,
  onSelectExercise,
}: {
  draft: WorkoutSessionDraft;
  onSelectExercise: (exerciseIndex: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">
        Exercícios da rotina
      </p>
      <div className="mt-3 space-y-2">
        {draft.routine.exercises.map((exercise, index) => {
          const exerciseDraft = draft.exercises[index];
          const status = getExerciseStatus(draft, index);

          return (
            <button
              className="flex w-full items-center gap-3 rounded-md bg-muted p-3 text-left"
              key={exercise.id}
              onClick={() => onSelectExercise(index)}
              type="button"
            >
              {status === "Concluído" ? (
                <Check
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {exercise.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {
                    exerciseDraft.completedSets.filter(
                      (set) => set.completedAt !== null,
                    ).length
                  }
                  /
                  {exerciseDraft.completedSets.length} séries
                </span>
              </span>
              <span className="shrink-0 rounded-md bg-background px-2 py-1 text-xs font-medium">
                {status}
              </span>
            </button>
          );
        })}
      </div>
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

function getExerciseStatus(
  draft: WorkoutSessionDraft,
  exerciseIndex: number,
): "Pendente" | "Em progresso" | "Concluído" {
  const exercise = draft.exercises[exerciseIndex];

  if (exercise.result.completedAt !== null) {
    return "Concluído";
  }

  if (
    draft.currentExerciseIndex === exerciseIndex ||
    exercise.completedSets.some((set) => set.completedAt !== null)
  ) {
    return "Em progresso";
  }

  return "Pendente";
}

function getNextExerciseIndex(
  draft: WorkoutSessionDraft,
  currentExerciseIndex: number,
) {
  const nextIndex = draft.exercises.findIndex(
    (exercise, exerciseIndex) =>
      exerciseIndex > currentExerciseIndex &&
      exercise.result.completedAt === null,
  );

  if (nextIndex >= 0) {
    return nextIndex;
  }

  const wrappedIndex = draft.exercises.findIndex(
    (exercise, exerciseIndex) =>
      exerciseIndex !== currentExerciseIndex &&
      exercise.result.completedAt === null,
  );

  return wrappedIndex >= 0 ? wrappedIndex : null;
}
