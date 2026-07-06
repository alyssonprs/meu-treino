import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import {
  ArrowLeft,
  Check,
  Circle,
  CircleDot,
  Minus,
  Plus,
  Save,
  Square,
} from "lucide-react";
import { ModalDialog } from "@/components/ModalDialog";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import {
  getNextPendingSetIndex,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import type { ExerciseLoadHistoryRecord } from "@/storage/workoutPlanRepository";
import { getExerciseGuide, type ExerciseGuide } from "./exerciseGuides";
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
  nextSetIndex: number;
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
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<
    number | null
  >(draft.currentExerciseIndex);
  const [isResultSheetOpen, setIsResultSheetOpen] = useState(false);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
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
  const hasIncompleteExercises = registeredExercises < draft.exercises.length;
  const nextExerciseIndex = getNextExerciseIndex(draft, currentExerciseIndex);
  const isCurrentExerciseRegistered =
    currentExerciseDraft?.result.completedAt !== null;
  const areAllSetsCompleted =
    currentExerciseDraft !== undefined && currentSetIndex === null;
  const exerciseGuide = currentExercise
    ? getExerciseGuide(currentExercise)
    : null;

  const [resultValues, setResultValues] = useState<
    Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">
  >({
    loadKg: currentExerciseDraft?.result.loadKg ?? "",
    reps: currentExerciseDraft?.result.reps ?? "",
    rir: currentExerciseDraft?.result.rir ?? "",
    notes: currentExerciseDraft?.result.notes ?? "",
  });

  useEffect(() => {
    setExpandedExerciseIndex(draft.currentExerciseIndex);
  }, [draft.currentExerciseIndex, draft.routine.id]);

  useEffect(() => {
    setRestState(null);
    setIsResultSheetOpen(false);
    setShowFinishConfirmation(false);
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
      <>
        <section className="mt-6 rounded-lg border border-border bg-card p-5">
          <h2 className="text-xl font-semibold">Treino indisponível</h2>
          <Button className="mt-4 w-full" onClick={onBackToDetail} type="button">
            Voltar para lista
          </Button>
        </section>
      </>
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

  function markSetCompleted(setIndex: number) {
    if (
      setIndex < 0 ||
      setIndex >= currentExerciseDraft.completedSets.length ||
      currentExerciseDraft.completedSets[setIndex]?.completedAt !== null
    ) {
      return;
    }

    onMarkSetCompleted({
      exerciseIndex: currentExerciseIndex,
      setIndex,
    });

    const nextSetIndex = setIndex + 1;

    if (nextSetIndex < currentExerciseDraft.completedSets.length) {
      setRestState({
        remainingSeconds: currentExercise.rest_seconds ?? 90,
        nextSetIndex,
        nextSetNumber: nextSetIndex + 1,
      });
      return;
    }

    setRestState(null);
    setIsResultSheetOpen(true);
  }

  function markCurrentSetCompleted() {
    if (currentSetIndex === null) {
      return;
    }

    markSetCompleted(currentSetIndex);
  }

  function selectExercise(exerciseIndex: number) {
    if (expandedExerciseIndex === exerciseIndex) {
      closeCurrentExerciseCard();
      return;
    }

    setExpandedExerciseIndex(exerciseIndex);
    onSelectExercise(exerciseIndex);
  }

  function closeCurrentExerciseCard() {
    setExpandedExerciseIndex(null);
    setIsResultSheetOpen(false);
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

    setRestState(null);
    setIsResultSheetOpen(false);

    if (nextExerciseIndex !== null) {
      selectExercise(nextExerciseIndex);
    }
  }

  function requestFinishWorkout() {
    if (!hasIncompleteExercises) {
      onFinish();
      return;
    }

    setShowFinishConfirmation(true);
  }

  const currentExerciseDetails = (
    <div className="mt-4 space-y-4">
      {exerciseGuide ? (
        <ExerciseGuidePanel guide={exerciseGuide} />
      ) : null}

      <div className="rounded-md bg-muted p-3">
        <SetProgress
          completedSetsCount={completedSetsCount}
          targetReps={currentExercise.target_reps}
          totalSets={currentExerciseDraft.completedSets.length}
        />

        {restState ? (
          <SetActionPanel
            restState={restState}
            onCompleteNextSet={() => markSetCompleted(restState.nextSetIndex)}
          />
        ) : isCurrentExerciseRegistered && nextExerciseIndex === null ? (
          <Button
            className="mt-4 h-14 w-full text-base"
            onClick={requestFinishWorkout}
            type="button"
          >
            Finalizar rotina
          </Button>
        ) : areAllSetsCompleted ? (
          <ExerciseResultPrompt
            onOpen={() => setIsResultSheetOpen(true)}
          />
        ) : (
          <SetActionPanel
            currentSetNumber={(currentSetIndex ?? 0) + 1}
            onCompleteNextSet={markCurrentSetCompleted}
          />
        )}
      </div>
    </div>
  );

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

      {message ? (
        <Notice tone="danger">
          {message}
        </Notice>
      ) : null}

      <ExerciseStatusList
        currentExerciseDetails={currentExerciseDetails}
        draft={draft}
        expandedExerciseIndex={expandedExerciseIndex}
        loadHistoryByExerciseId={loadHistoryByExerciseId}
        onSelectExercise={selectExercise}
      />

      <ExerciseResultSheet
        canSaveResult={canSaveResult}
        isOpen={
          isResultSheetOpen &&
          areAllSetsCompleted &&
          !isCurrentExerciseRegistered
        }
        resultValues={resultValues}
        onClose={() => setIsResultSheetOpen(false)}
        onDecrementLoad={() => incrementField("loadKg", -2.5)}
        onDecrementReps={() => incrementField("reps", -1)}
        onIncrementLoad={() => incrementField("loadKg", 2.5)}
        onIncrementReps={() => incrementField("reps", 1)}
        onSave={saveCurrentExerciseResult}
        onUpdateResultValue={updateResultValue}
      />

      <ModalDialog
        description="Ainda há exercícios sem registro. Finalize mesmo assim somente se o treino acabou por hoje."
        isOpen={showFinishConfirmation}
        onClose={() => setShowFinishConfirmation(false)}
        title="Finalizar treino incompleto?"
      >
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            className="h-12"
            onClick={() => setShowFinishConfirmation(false)}
            type="button"
            variant="secondary"
          >
            Continuar
          </Button>
          <Button className="h-12" onClick={onFinish} type="button">
            Finalizar
          </Button>
        </div>
      </ModalDialog>

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
        <Button className="h-12 gap-2" onClick={requestFinishWorkout} type="button">
          <Square className="h-4 w-4" aria-hidden="true" />
          Finalizar
        </Button>
      </div>
    </section>
  );
}

function ExerciseGuidePanel({ guide }: { guide: ExerciseGuide }) {
  const primaryLabel = guide.primaryMuscles.join(", ");
  const secondaryLabel = guide.secondaryMuscles.join(", ");
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  useEffect(() => {
    setIsAnimationReady(false);

    if (!guide.animationUrl) {
      return;
    }

    const animation = new Image();
    let isCurrent = true;

    animation.onload = () => {
      if (isCurrent) {
        setIsAnimationReady(true);
      }
    };
    animation.onerror = () => {
      if (isCurrent) {
        setIsAnimationReady(false);
      }
    };
    animation.src = guide.animationUrl;

    return () => {
      isCurrent = false;
    };
  }, [guide.animationUrl, guide.imageUrl]);

  const mediaUrl =
    isAnimationReady && guide.animationUrl
      ? guide.animationUrl
      : guide.imageUrl;

  return (
    <div className="mt-4 rounded-md border border-border bg-muted p-3">
      <div className="space-y-3">
        {mediaUrl ? (
          <div className="overflow-hidden rounded-md border border-border bg-background">
            <img
              alt={guide.imageAlt}
              className="aspect-[16/9] w-full object-contain"
              height={360}
              loading="lazy"
              src={mediaUrl}
              width={640}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <MuscleBadge label={`Principal: ${primaryLabel}`} tone="primary" />
          {secondaryLabel ? (
            <MuscleBadge label={`Ajuda: ${secondaryLabel}`} tone="secondary" />
          ) : null}
        </div>

        {guide.executionCues.length > 0 ? (
          <ul className="space-y-2">
            {guide.executionCues.map((cue) => (
              <li
                className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
                key={cue}
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function MuscleBadge({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "secondary";
}) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-1 text-xs font-semibold",
        tone === "primary"
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-info/30 bg-info/10 text-info",
      )}
    >
      {label}
    </span>
  );
}

function StepperInput({
  inputRef,
  label,
  name,
  suffix,
  value,
  onChange,
  onDecrement,
  onIncrement,
}: {
  inputRef?: Ref<HTMLInputElement>;
  label: string;
  name: string;
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
            autoComplete="off"
            className="h-12 w-full min-w-0 rounded-md bg-transparent text-center text-3xl font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            inputMode="decimal"
            name={name}
            onChange={(event) => onChange(event.target.value)}
            ref={inputRef}
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

function SetProgress({
  completedSetsCount,
  targetReps,
  totalSets,
}: {
  completedSetsCount: number;
  targetReps: string;
  totalSets: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Séries</p>
          <p className="mt-1 text-sm font-semibold">
            {completedSetsCount}/{totalSets}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">
            Movimentos por série
          </p>
          <p className="mt-1 text-sm font-semibold">{targetReps}</p>
        </div>
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

function SetActionPanel({
  currentSetNumber,
  restState,
  onCompleteNextSet,
}: {
  currentSetNumber?: number;
  restState?: RestState;
  onCompleteNextSet: () => void;
}) {
  const ariaLabel = restState
    ? `Concluir série ${restState.nextSetNumber}`
    : `Concluir série ${currentSetNumber ?? ""}`.trim();

  return (
    <div className="mt-4">
      <Button
        className={cn(
          "relative h-14 w-full gap-3 px-4 text-base",
          restState ? "pr-20" : "",
        )}
        aria-label={ariaLabel}
        onClick={onCompleteNextSet}
        type="button"
      >
        <Check className="h-5 w-5" aria-hidden="true" />
        <span>Concluir série</span>
        {restState ? (
          <>
            <span className="absolute right-3 rounded-md bg-primary-foreground/15 px-2 py-1 text-sm font-semibold tabular-nums">
              {formatTimer(restState.remainingSeconds)}
            </span>
            <span className="sr-only" aria-live="polite">
              Descanso restante: {formatTimer(restState.remainingSeconds)}
            </span>
          </>
        ) : null}
      </Button>
    </div>
  );
}

function ExerciseResultPrompt({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Séries concluídas</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Registre carga e reps para fechar o exercício.
          </p>
        </div>
        <Button
          className="h-12 shrink-0 gap-2 px-3"
          onClick={onOpen}
          type="button"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Registrar
        </Button>
      </div>
    </div>
  );
}

function ExerciseResultSheet({
  canSaveResult,
  isOpen,
  resultValues,
  onClose,
  onDecrementLoad,
  onDecrementReps,
  onIncrementLoad,
  onIncrementReps,
  onSave,
  onUpdateResultValue,
}: {
  canSaveResult: boolean;
  isOpen: boolean;
  resultValues: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  onClose: () => void;
  onDecrementLoad: () => void;
  onDecrementReps: () => void;
  onIncrementLoad: () => void;
  onIncrementReps: () => void;
  onSave: () => void;
  onUpdateResultValue: (field: EditableResultField, value: string) => void;
}) {
  const loadInputRef = useRef<HTMLInputElement>(null);

  return (
    <ModalDialog
      description="Uma vez por exercício."
      initialFocusRef={loadInputRef}
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar resultado"
    >
      <div className="mt-4 grid gap-3">
        <StepperInput
          inputRef={loadInputRef}
          label="Carga"
          name="exercise-load-kg"
          suffix="kg"
          value={resultValues.loadKg}
          onChange={(value) => onUpdateResultValue("loadKg", value)}
          onDecrement={onDecrementLoad}
          onIncrement={onIncrementLoad}
        />
        <StepperInput
          label="Reps"
          name="exercise-reps"
          value={resultValues.reps}
          onChange={(value) => onUpdateResultValue("reps", value)}
          onDecrement={onDecrementReps}
          onIncrement={onIncrementReps}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button className="h-12" onClick={onClose} type="button" variant="secondary">
          Fechar
        </Button>
        <Button
          className="h-12 gap-2"
          disabled={!canSaveResult}
          onClick={onSave}
          type="button"
        >
          <Save className="h-5 w-5" aria-hidden="true" />
          Concluir
        </Button>
      </div>
    </ModalDialog>
  );
}

function ExerciseStatusList({
  currentExerciseDetails,
  draft,
  expandedExerciseIndex,
  loadHistoryByExerciseId,
  onSelectExercise,
}: {
  currentExerciseDetails: ReactNode;
  draft: WorkoutSessionDraft;
  expandedExerciseIndex: number | null;
  loadHistoryByExerciseId: Map<string, ExerciseLoadHistoryRecord>;
  onSelectExercise: (exerciseIndex: number) => void;
}) {
  const currentExerciseCardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (expandedExerciseIndex === null) {
      return;
    }

    const currentExerciseCard = currentExerciseCardRef.current;

    if (!currentExerciseCard) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        currentExerciseCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      });
    }, 60);

    return () => window.clearTimeout(timeoutId);
  }, [expandedExerciseIndex]);

  return (
    <div className="space-y-4">
      <RoutineStepList
        label="Aquecimento"
        steps={draft.routine.warmup}
        variant="warmup"
      />

      <div className="space-y-2">
        <RoutineSectionLabel>Exercícios da rotina</RoutineSectionLabel>
        {draft.routine.exercises.map((exercise, index) => {
          const exerciseDraft = draft.exercises[index];
          const isExpanded =
            expandedExerciseIndex === index && draft.currentExerciseIndex === index;
          const selectedExerciseIndex =
            expandedExerciseIndex === null ? null : draft.currentExerciseIndex;
          const status = getExerciseStatus(draft, index, selectedExerciseIndex);
          const statusMeta = getExerciseStatusMeta(status);
          const completedSetsCount = exerciseDraft.completedSets.filter(
            (set) => set.completedAt !== null,
          ).length;
          const loadHistory = isExpanded
            ? loadHistoryByExerciseId.get(exercise.exerciseId)
            : undefined;

          return (
            <ExerciseStatusButton
              completedSetsCount={completedSetsCount}
              currentExerciseDetails={currentExerciseDetails}
              currentExerciseRef={isExpanded ? currentExerciseCardRef : undefined}
              exercise={exercise}
              exerciseIndex={index}
              isExpanded={isExpanded}
              key={exercise.id}
              loadHistory={loadHistory}
              onSelectExercise={onSelectExercise}
              status={status}
              statusMeta={statusMeta}
              totalSets={exerciseDraft.completedSets.length}
            />
          );
        })}
      </div>

      <RoutineStepList
        label="Cooldown"
        steps={draft.routine.cooldown}
        variant="cooldown"
      />
    </div>
  );
}

function RoutineSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 text-xs font-semibold uppercase tracking-wide text-info">
      {children}
    </p>
  );
}

function RoutineStepList({
  label,
  steps,
  variant,
}: {
  label: string;
  steps: WorkoutSessionDraft["routine"]["warmup"];
  variant: "warmup" | "cooldown";
}) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <RoutineSectionLabel>{label}</RoutineSectionLabel>
      {steps.map((step) => (
        <div
          className={cn(
            "rounded-md border p-3 text-sm",
            variant === "warmup"
              ? "border-warning/40 bg-warning/10"
              : "border-info/40 bg-info/10",
          )}
          key={step.id}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{step.activity}</p>
            <span className="shrink-0 rounded-md bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
              {step.duration_minutes} min
            </span>
          </div>
          {step.notes ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {step.notes}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ExerciseStatusButton({
  completedSetsCount,
  currentExerciseDetails,
  currentExerciseRef,
  exercise,
  exerciseIndex,
  status,
  statusMeta,
  totalSets,
  isExpanded,
  loadHistory,
  onSelectExercise,
}: {
  completedSetsCount: number;
  currentExerciseDetails: ReactNode;
  currentExerciseRef?: Ref<HTMLElement>;
  exercise: WorkoutSessionDraft["routine"]["exercises"][number];
  exerciseIndex: number;
  status: ReturnType<typeof getExerciseStatus>;
  statusMeta: ReturnType<typeof getExerciseStatusMeta>;
  totalSets: number;
  isExpanded: boolean;
  loadHistory: ExerciseLoadHistoryRecord | undefined;
  onSelectExercise: (exerciseIndex: number) => void;
}) {
  if (isExpanded) {
    return (
      <article
        aria-current="step"
        aria-label={`${exercise.name}: ${status}, ${completedSetsCount} de ${totalSets} series concluidas`}
        className={cn(
          "exercise-card-open w-full rounded-lg border p-3 text-left shadow-sm transition-colors",
          statusMeta.itemClassName,
        )}
        ref={currentExerciseRef}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background/80 ring-1 ring-border/70">
            <statusMeta.Icon
              className={cn("h-4 w-4", statusMeta.iconClassName)}
              aria-hidden="true"
            />
          </span>
          <span className="min-w-0 flex-1">
            <button
              aria-label={`Recolher card de ${exercise.name}`}
              className="block w-full break-words rounded-sm text-left text-sm font-semibold leading-5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onSelectExercise(exerciseIndex)}
              type="button"
            >
              {exercise.name}
            </button>
          </span>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
              statusMeta.badgeClassName,
            )}
          >
            {status}
          </span>
        </div>
        <span className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-xs">
          <span className="font-medium text-muted-foreground">
            Carga anterior
          </span>
          <span className="min-w-0 truncate font-semibold text-foreground">
            {loadHistory
              ? `${formatLoad(loadHistory.lastLoadKg)} kg x ${loadHistory.lastReps}`
              : "Sem carga anterior"}
          </span>
        </span>
        {currentExerciseDetails}
      </article>
    );
  }

  return (
    <button
      aria-label={`${exercise.name}: ${status}, ${completedSetsCount} de ${totalSets} series concluidas`}
      className={cn(
        "w-full rounded-lg border p-3 text-left shadow-sm transition-all duration-200 active:scale-[0.99]",
        statusMeta.itemClassName,
      )}
      onClick={() => onSelectExercise(exerciseIndex)}
      type="button"
    >
      <span className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background/80 ring-1 ring-border/70">
          <statusMeta.Icon
            className={cn("h-4 w-4", statusMeta.iconClassName)}
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-semibold leading-5 text-foreground">
            {exercise.name}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
            statusMeta.badgeClassName,
          )}
        >
          {status}
        </span>
      </span>
    </button>
  );
}

function getExerciseStatus(
  draft: WorkoutSessionDraft,
  exerciseIndex: number,
  selectedExerciseIndex: number | null = draft.currentExerciseIndex,
): "Pendente" | "Em progresso" | "Concluído" {
  const exercise = draft.exercises[exerciseIndex];

  if (exercise.result.completedAt !== null) {
    return "Concluído";
  }

  if (
    selectedExerciseIndex === exerciseIndex ||
    exercise.completedSets.some((set) => set.completedAt !== null)
  ) {
    return "Em progresso";
  }

  return "Pendente";
}

function getExerciseStatusMeta(status: ReturnType<typeof getExerciseStatus>) {
  if (status === "Concluído") {
    return {
      Icon: Check,
      itemClassName: "border-primary/50 bg-primary/10",
      iconClassName: "text-primary",
      badgeClassName: "bg-primary text-primary-foreground",
    };
  }

  if (status === "Em progresso") {
    return {
      Icon: CircleDot,
      itemClassName: "border-info/60 bg-info/10",
      iconClassName: "text-info",
      badgeClassName: "bg-info text-info-foreground",
    };
  }

  return {
    Icon: Circle,
    itemClassName: "border-border bg-muted",
    iconClassName: "text-muted-foreground",
    badgeClassName: "bg-background text-muted-foreground",
  };
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
