import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { ArrowLeft, Check, Minus, Plus, Save } from "lucide-react";
import { ModalDialog } from "@/components/ModalDialog";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import {
  getNextPendingSetIndex,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import type { ExerciseLoadHistoryRecord } from "@/storage/workoutPlanRepository";
import { getExerciseGuide, type ExerciseGuide } from "./exerciseGuides";
import type { ActiveRestTimer } from "./restTimer";
import { formatLoad } from "./workoutFormatters";

type EditableResultField = keyof Pick<
  WorkoutSetDraft,
  "loadKg" | "reps" | "rir" | "notes"
>;

type ActiveExerciseScreenProps = {
  draft: WorkoutSessionDraft;
  loadHistoryByExerciseId: Map<string, ExerciseLoadHistoryRecord>;
  message: string | null;
  restTimer: ActiveRestTimer | null;
  onBackToList: () => void;
  onFinish: () => void;
  onMarkSetCompleted: (input: { exerciseIndex: number; setIndex: number }) => void;
  onOpenExercise: (exerciseIndex: number) => void;
  onSaveExerciseResult: (input: {
    exerciseIndex: number;
    values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  }) => void;
  onUpdateExerciseResult: (input: {
    exerciseIndex: number;
    field: EditableResultField;
    value: string;
  }) => void;
};

export function ActiveExerciseScreen({
  draft,
  loadHistoryByExerciseId,
  message,
  restTimer,
  onBackToList,
  onFinish,
  onMarkSetCompleted,
  onOpenExercise,
  onSaveExerciseResult,
  onUpdateExerciseResult,
}: ActiveExerciseScreenProps) {
  const [isResultSheetOpen, setIsResultSheetOpen] = useState(false);
  const [showCompletionActions, setShowCompletionActions] = useState(false);
  const currentExerciseIndex = draft.currentExerciseIndex;
  const currentExercise = draft.routine.exercises[currentExerciseIndex];
  const currentExerciseDraft = draft.exercises[currentExerciseIndex];
  const currentSetIndex = getNextPendingSetIndex(draft, currentExerciseIndex);
  const isCurrentExerciseRegistered = currentExerciseDraft?.result.completedAt !== null;
  const areAllSetsCompleted = currentExerciseDraft !== undefined && currentSetIndex === null;
  const completedSetsCount = currentExerciseDraft?.completedSets.filter((set) => set.completedAt !== null).length ?? 0;
  const nextExerciseIndex = getNextExerciseIndex(draft, currentExerciseIndex);
  const exerciseGuide = currentExercise ? getExerciseGuide(currentExercise) : null;
  const loadHistory = currentExercise
    ? loadHistoryByExerciseId.get(currentExercise.exerciseId)
    : undefined;
  const isRestingCurrentExercise = restTimer?.exerciseIndex === currentExerciseIndex;
  const [resultValues, setResultValues] = useState<
    Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">
  >({
    loadKg: currentExerciseDraft?.result.loadKg ?? "",
    reps: currentExerciseDraft?.result.reps ?? "",
    rir: currentExerciseDraft?.result.rir ?? "",
    notes: currentExerciseDraft?.result.notes ?? "",
  });

  useEffect(() => {
    setIsResultSheetOpen(false);
    setShowCompletionActions(false);
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

  if (!currentExercise || !currentExerciseDraft) {
    return (
      <Card className="mt-6" padding="lg" variant="outlined">
        <h2 className="text-xl font-semibold">Exercício indisponível</h2>
        <Button className="mt-4 w-full" onClick={onBackToList} type="button">
          Voltar para lista
        </Button>
      </Card>
    );
  }

  const canSaveResult =
    areAllSetsCompleted &&
    !isCurrentExerciseRegistered &&
    resultValues.loadKg.trim() !== "" &&
    resultValues.reps.trim() !== "";

  function updateResultValue(field: EditableResultField, value: string) {
    setResultValues((current) => ({ ...current, [field]: value }));
    onUpdateExerciseResult({ exerciseIndex: currentExerciseIndex, field, value });
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

    onMarkSetCompleted({ exerciseIndex: currentExerciseIndex, setIndex });

    if (setIndex + 1 >= currentExerciseDraft.completedSets.length) {
      setIsResultSheetOpen(true);
    }
  }

  function saveCurrentExerciseResult() {
    if (!canSaveResult) {
      return;
    }

    onSaveExerciseResult({
      exerciseIndex: currentExerciseIndex,
      values: { ...resultValues, rir: "" },
    });
    setIsResultSheetOpen(false);
    setShowCompletionActions(true);
  }

  function openNextExercise() {
    if (nextExerciseIndex === null) {
      return;
    }

    setShowCompletionActions(false);
    onOpenExercise(nextExerciseIndex);
  }

  return (
    <section className="min-h-screen pb-24 pt-2">
      <header className="flex items-center justify-between gap-2">
        <Button
          aria-label="Voltar para lista de exercícios"
          className="h-11 w-11 shrink-0 p-0"
          onClick={onBackToList}
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs font-medium text-md-on-surface-variant">
            {draft.routine.name}
          </p>
          <h2 className="truncate text-lg font-semibold">{currentExercise.name}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-md-surface-container-high px-3 py-2 text-xs font-semibold tabular-nums">
          {currentExerciseIndex + 1}/{draft.exercises.length}
        </span>
      </header>

      {message ? <Notice className="mt-4" tone="danger">{message}</Notice> : null}

      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-md-on-surface-variant">Carga anterior</span>
            <span className="min-w-0 truncate font-semibold text-md-on-surface">
              {loadHistory ? `${formatLoad(loadHistory.lastLoadKg)} kg × ${loadHistory.lastReps}` : "Sem carga anterior"}
            </span>
          </div>
        </div>

        {exerciseGuide ? <ExerciseGuidePanel guide={exerciseGuide} /> : null}

        <div className="rounded-xl bg-md-surface-container-high p-4">
          <SetProgress
            completedSetsCount={completedSetsCount}
            targetReps={currentExercise.target_reps}
            totalSets={currentExerciseDraft.completedSets.length}
          />

          {isCurrentExerciseRegistered ? (
            <CompletedExercisePanel
              hasNextExercise={nextExerciseIndex !== null}
              onBackToList={onBackToList}
              onOpenNextExercise={openNextExercise}
            />
          ) : areAllSetsCompleted ? (
            <ExerciseResultPrompt onOpen={() => setIsResultSheetOpen(true)} />
          ) : (
            <SetActionPanel
              currentSetNumber={(currentSetIndex ?? 0) + 1}
              isResting={isRestingCurrentExercise}
              onCompleteNextSet={() => {
                const nextSet = isRestingCurrentExercise
                  ? restTimer?.nextSetIndex
                  : currentSetIndex;

                if (nextSet !== undefined && nextSet !== null) {
                  markSetCompleted(nextSet);
                }
              }}
            />
          )}
        </div>
      </div>

      <ExerciseResultSheet
        canSaveResult={canSaveResult}
        isOpen={isResultSheetOpen && areAllSetsCompleted && !isCurrentExerciseRegistered}
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
        description={
          nextExerciseIndex === null
            ? "Todos os exercícios desta rotina foram registrados."
            : "Escolha como deseja seguir o treino."
        }
        isOpen={showCompletionActions}
        onClose={() => setShowCompletionActions(false)}
        title="Exercício concluído"
      >
        <div className="mt-4 grid gap-2">
          {nextExerciseIndex !== null ? (
            <Button className="h-12" onClick={openNextExercise} type="button">
              Próximo exercício
            </Button>
          ) : (
            <Button className="h-12" onClick={onFinish} type="button">
              Finalizar rotina
            </Button>
          )}
          <Button className="h-12" onClick={onBackToList} type="button" variant="secondary">
            Voltar à lista
          </Button>
        </div>
      </ModalDialog>
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
    animation.onload = () => isCurrent && setIsAnimationReady(true);
    animation.onerror = () => isCurrent && setIsAnimationReady(false);
    animation.src = guide.animationUrl;

    return () => {
      isCurrent = false;
    };
  }, [guide.animationUrl, guide.imageUrl]);

  const mediaUrl = isAnimationReady && guide.animationUrl ? guide.animationUrl : guide.imageUrl;

  return (
    <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-high p-3">
      <div className="space-y-3">
        {mediaUrl ? (
          <div className="overflow-hidden rounded-lg border border-md-outline-variant bg-md-surface-container-lowest">
            <img alt={guide.imageAlt} className="aspect-[16/9] w-full object-contain" height={360} loading="lazy" src={mediaUrl} width={640} />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <MuscleBadge label={`Principal: ${primaryLabel}`} tone="primary" />
          {secondaryLabel ? <MuscleBadge label={`Ajuda: ${secondaryLabel}`} tone="secondary" /> : null}
        </div>
        {guide.executionCues.length > 0 ? (
          <ul className="space-y-2">
            {guide.executionCues.map((cue) => (
              <li className="flex items-start gap-2 text-sm leading-5 text-md-on-surface-variant" key={cue}>
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-md-primary" aria-hidden="true" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function MuscleBadge({ label, tone }: { label: string; tone: "primary" | "secondary" }) {
  return (
    <span className={cn("rounded-full border px-2 py-1 text-xs font-semibold", tone === "primary" ? "border-md-primary/40 bg-md-primary/15 text-md-primary" : "border-md-secondary/30 bg-md-secondary-container text-md-on-secondary-container")}>
      {label}
    </span>
  );
}

function SetProgress({ completedSetsCount, targetReps, totalSets }: { completedSetsCount: number; targetReps: string; totalSets: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-md-on-surface-variant">Séries</p>
          <p className="mt-1 text-lg font-semibold">{completedSetsCount}/{totalSets}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-md-on-surface-variant">Movimentos por série</p>
          <p className="mt-1 text-lg font-semibold">{targetReps}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${totalSets}, minmax(0, 1fr))` }}>
        {Array.from({ length: totalSets }, (_, index) => (
          <span className={index < completedSetsCount ? "h-2 rounded-full bg-md-primary" : "h-2 rounded-full bg-md-outline-variant"} key={index} />
        ))}
      </div>
    </div>
  );
}

function SetActionPanel({ currentSetNumber, isResting, onCompleteNextSet }: { currentSetNumber: number; isResting: boolean; onCompleteNextSet: () => void }) {
  return (
    <div className="mt-4">
      {isResting ? <p className="mb-2 text-center text-xs font-medium text-md-on-surface-variant">Descanso em andamento no timer flutuante.</p> : null}
      <Button aria-label={`Concluir série ${currentSetNumber}`} className="h-14 w-full gap-3 text-base" onClick={onCompleteNextSet} type="button">
        <Check className="h-5 w-5" aria-hidden="true" />
        Concluir série
      </Button>
    </div>
  );
}

function CompletedExercisePanel({ hasNextExercise, onBackToList, onOpenNextExercise }: { hasNextExercise: boolean; onBackToList: () => void; onOpenNextExercise: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-md-primary/30 bg-md-primary/10 p-3">
      <p className="text-sm font-semibold text-md-on-surface">Exercício concluído</p>
      <p className="mt-1 text-xs leading-5 text-md-on-surface-variant">O resultado já está registrado nesta rotina.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="h-12" onClick={onBackToList} type="button" variant="secondary">Lista</Button>
        {hasNextExercise ? <Button className="h-12" onClick={onOpenNextExercise} type="button">Próximo</Button> : null}
      </div>
    </div>
  );
}

function ExerciseResultPrompt({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-md-outline-variant bg-md-surface-container-lowest p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Séries concluídas</h3>
          <p className="mt-1 text-xs leading-5 text-md-on-surface-variant">Registre carga e reps para fechar o exercício.</p>
        </div>
        <Button className="h-12 shrink-0 gap-2 px-3" onClick={onOpen} type="button">
          <Save className="h-4 w-4" aria-hidden="true" />
          Registrar
        </Button>
      </div>
    </div>
  );
}

function StepperInput({ enterKeyHint, inputRef, label, name, suffix, value, onChange, onDecrement, onEnter, onIncrement }: { enterKeyHint?: "done" | "next"; inputRef?: Ref<HTMLInputElement>; label: string; name: string; suffix?: string; value: string; onChange: (value: string) => void; onDecrement: () => void; onEnter?: () => void; onIncrement: () => void }) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && onEnter) {
      event.preventDefault();
      onEnter();
    }
  }

  return (
    <div className="grid grid-cols-[3.25rem_1fr_3.25rem] items-center gap-3 rounded-lg border border-md-outline-variant bg-md-surface-container-lowest p-3">
      <Button aria-label={`Diminuir ${label}`} className="h-12 w-12 p-0" onClick={onDecrement} type="button" variant="secondary"><Minus className="h-5 w-5" aria-hidden="true" /></Button>
      <label className="min-w-0 text-center">
        <span className="text-xs font-medium text-md-on-surface-variant">{label}</span>
        <div className="mt-1 flex items-baseline justify-center gap-1">
          <input autoComplete="off" className="h-12 w-full min-w-0 rounded-md bg-transparent text-center text-3xl font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" enterKeyHint={enterKeyHint} inputMode="decimal" name={name} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} ref={inputRef} type="text" value={value} />
          {suffix ? <span className="text-sm font-medium text-md-on-surface-variant">{suffix}</span> : null}
        </div>
      </label>
      <Button aria-label={`Aumentar ${label}`} className="h-12 w-12 p-0" onClick={onIncrement} type="button" variant="secondary"><Plus className="h-5 w-5" aria-hidden="true" /></Button>
    </div>
  );
}

function ExerciseResultSheet({ canSaveResult, isOpen, resultValues, onClose, onDecrementLoad, onDecrementReps, onIncrementLoad, onIncrementReps, onSave, onUpdateResultValue }: { canSaveResult: boolean; isOpen: boolean; resultValues: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">; onClose: () => void; onDecrementLoad: () => void; onDecrementReps: () => void; onIncrementLoad: () => void; onIncrementReps: () => void; onSave: () => void; onUpdateResultValue: (field: EditableResultField, value: string) => void }) {
  const loadInputRef = useRef<HTMLInputElement>(null);
  const repsInputRef = useRef<HTMLInputElement>(null);

  return (
    <ModalDialog description="Uma vez por exercício." initialFocusRef={loadInputRef} isOpen={isOpen} onClose={onClose} title="Registrar resultado">
      <div className="mt-4 grid gap-3">
        <StepperInput enterKeyHint="next" inputRef={loadInputRef} label="Carga" name="exercise-load-kg" suffix="kg" value={resultValues.loadKg} onChange={(value) => onUpdateResultValue("loadKg", value)} onDecrement={onDecrementLoad} onEnter={() => repsInputRef.current?.focus()} onIncrement={onIncrementLoad} />
        <StepperInput enterKeyHint="done" inputRef={repsInputRef} label="Reps" name="exercise-reps" value={resultValues.reps} onChange={(value) => onUpdateResultValue("reps", value)} onDecrement={onDecrementReps} onEnter={() => canSaveResult && onSave()} onIncrement={onIncrementReps} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button className="h-12" onClick={onClose} type="button" variant="secondary">Fechar</Button>
        <Button className="h-12 gap-2" disabled={!canSaveResult} onClick={onSave} type="button"><Save className="h-5 w-5" aria-hidden="true" />Concluir</Button>
      </div>
    </ModalDialog>
  );
}

function getNextExerciseIndex(draft: WorkoutSessionDraft, currentExerciseIndex: number) {
  const nextIndex = draft.exercises.findIndex(
    (exercise, exerciseIndex) => exerciseIndex > currentExerciseIndex && exercise.result.completedAt === null,
  );

  if (nextIndex >= 0) {
    return nextIndex;
  }

  const wrappedIndex = draft.exercises.findIndex(
    (exercise, exerciseIndex) => exerciseIndex !== currentExerciseIndex && exercise.result.completedAt === null,
  );

  return wrappedIndex >= 0 ? wrappedIndex : null;
}
