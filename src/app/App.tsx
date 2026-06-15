import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  Download,
  Dumbbell,
  FileInput,
  History,
  Home,
  Play,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  TrendingUp,
  TimerReset,
  X,
} from "lucide-react";
import modelJsonUrl from "@/assets/meu-treino-modelo.json?url";
import { Button } from "@/components/ui/button";
import { ThemeSegmentedControl } from "@/features/settings/ThemeSegmentedControl";
import {
  activateImportedWorkoutPlan,
  parseWorkoutPlanImport,
  type WorkoutPlanPreview,
} from "@/services/workoutImportService";
import {
  createLoadHistoryMap,
  getCycleProgressSummary,
  getExerciseLoadSummaries,
  type ExerciseLoadSummary,
} from "@/services/progressService";
import {
  getNextRecommendedRoutineFromSnapshot,
  type NextRoutineRecommendation,
} from "@/services/workoutRecommendationService";
import {
  createWorkoutSessionDraft,
  finishWorkoutSession,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import { pwaWorkoutPlanRepository } from "@/storage/pwa/dexieWorkoutPlanRepository";
import type {
  ActiveWorkoutPlanSnapshot,
  ExerciseLoadHistoryRecord,
} from "@/storage/workoutPlanRepository";

type ImportStatus =
  | {
      state: "idle";
      fileName: null;
      preview: null;
      errors: [];
    }
  | {
      state: "preview";
      fileName: string;
      preview: WorkoutPlanPreview;
      errors: [];
    }
  | {
      state: "error";
      fileName: string | null;
      preview: null;
      errors: { path: string; message: string }[];
    }
  | {
      state: "saving";
      fileName: string;
      preview: WorkoutPlanPreview;
      errors: [];
    }
  | {
      state: "saved";
      fileName: string;
      preview: WorkoutPlanPreview;
      errors: [];
    };

const idleImportStatus: ImportStatus = {
  state: "idle",
  fileName: null,
  preview: null,
  errors: [],
};

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePlan, setActivePlan] = useState<ActiveWorkoutPlanSnapshot | null>(
    null,
  );
  const [isLoadingActivePlan, setIsLoadingActivePlan] = useState(true);
  const [activeWorkout, setActiveWorkout] =
    useState<WorkoutSessionDraft | null>(null);
  const [workoutLoadHistory, setWorkoutLoadHistory] = useState<
    Map<string, ExerciseLoadHistoryRecord>
  >(new Map());
  const [loadSummaries, setLoadSummaries] = useState<ExerciseLoadSummary[]>([]);
  const [workoutMessage, setWorkoutMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] =
    useState<ImportStatus>(idleImportStatus);

  useEffect(() => {
    let isMounted = true;

    pwaWorkoutPlanRepository
      .getActivePlan()
      .then((plan) => {
        if (isMounted) {
          setActivePlan(plan);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWorkoutMessage(
            "Nao foi possivel carregar os dados locais agora.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingActivePlan(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!activePlan) {
      setLoadSummaries([]);
      return () => {
        isMounted = false;
      };
    }

    getExerciseLoadSummaries({
      activePlan,
      repository: pwaWorkoutPlanRepository,
    }).then((summaries) => {
      if (isMounted) {
        setLoadSummaries(summaries);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activePlan]);

  async function handleImportFile(file: File) {
    const fileName = file.name;

    try {
      const text = await file.text();
      const result = parseWorkoutPlanImport(text);

      if (!result.success) {
        setImportStatus({
          state: "error",
          fileName,
          preview: null,
          errors: result.errors,
        });
        return;
      }

      setImportStatus({
        state: "preview",
        fileName,
        preview: result.preview,
        errors: [],
      });
    } catch {
      setImportStatus({
        state: "error",
        fileName,
        preview: null,
        errors: [
          {
            path: "arquivo",
            message: "Nao foi possivel ler o arquivo selecionado",
          },
        ],
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleActivatePlan() {
    if (importStatus.state !== "preview") {
      return;
    }

    const preview = importStatus.preview;
    const fileName = importStatus.fileName;

    setImportStatus({
      state: "saving",
      fileName,
      preview,
      errors: [],
    });

    try {
      await activateImportedWorkoutPlan({
        preview,
        repository: pwaWorkoutPlanRepository,
      });
      const savedPlan = await pwaWorkoutPlanRepository.getActivePlan();
      setActivePlan(savedPlan);
      setImportStatus({
        state: "saved",
        fileName,
        preview,
        errors: [],
      });
    } catch {
      setImportStatus({
        state: "error",
        fileName,
        preview: null,
        errors: [
          {
            path: "armazenamento",
            message: "Nao foi possivel ativar o plano neste dispositivo",
          },
        ],
      });
    }
  }

  const hasActivePlan = Boolean(activePlan);
  const nextRecommendation = activePlan
    ? getNextRecommendedRoutineFromSnapshot(activePlan)
    : null;
  const cycleProgress = activePlan
    ? getCycleProgressSummary(activePlan)
    : null;

  async function handleStartRecommendedWorkout() {
    if (!activePlan || !nextRecommendation) {
      return;
    }

    const routine = activePlan.routines.find(
      (item) => item.id === nextRecommendation.routineId,
    );

    if (!routine) {
      return;
    }

    const history = await pwaWorkoutPlanRepository.getExerciseLoadHistory(
      routine.exercises.map((exercise) => exercise.exerciseId),
    );
    const loadHistoryByExerciseId = createLoadHistoryMap(history);

    setWorkoutLoadHistory(loadHistoryByExerciseId);
    setWorkoutMessage(null);
    setActiveWorkout(
      createWorkoutSessionDraft({
        planId: activePlan.plan.id,
        routine,
        startedAt: new Date().toISOString(),
        loadHistoryByExerciseId,
      }),
    );
  }

  async function handleFinishWorkout() {
    if (!activeWorkout) {
      return;
    }

    const result = await finishWorkoutSession({
      draft: activeWorkout,
      completedAt: new Date().toISOString(),
      repository: pwaWorkoutPlanRepository,
    });

    if (!result.success) {
      setWorkoutMessage(result.message);
      return;
    }

    const updatedPlan = await pwaWorkoutPlanRepository.getActivePlan();
    setActivePlan(updatedPlan);
    setActiveWorkout(null);
    setWorkoutLoadHistory(new Map());
    setWorkoutMessage("Treino finalizado e salvo neste dispositivo.");
  }

  function updateWorkoutSet({
    exerciseIndex,
    setIndex,
    field,
    value,
  }: {
    exerciseIndex: number;
    setIndex: number;
    field: keyof WorkoutSetDraft;
    value: string;
  }) {
    setActiveWorkout((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set, currentSetIndex) =>
              currentSetIndex === setIndex ? { ...set, [field]: value } : set,
            ),
          };
        }),
      };
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-4">
        <header className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dados locais
            </p>
            <h1 className="text-2xl font-semibold">Meu Treino</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </div>
        </header>

        {activeWorkout ? (
          <ActiveWorkoutScreen
            draft={activeWorkout}
            loadHistoryByExerciseId={workoutLoadHistory}
            message={workoutMessage}
            onCancel={() => {
              setActiveWorkout(null);
              setWorkoutMessage(null);
            }}
            onFinish={() => {
              void handleFinishWorkout();
            }}
            onUpdateSet={updateWorkoutSet}
          />
        ) : (
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
              onClick={() => fileInputRef.current?.click()}
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

          <input
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void handleImportFile(file);
              }
            }}
            ref={fileInputRef}
            type="file"
          />
        </section>

        <ImportPanel
          importStatus={importStatus}
          onActivatePlan={() => {
            void handleActivatePlan();
          }}
          onChooseAnotherFile={() => fileInputRef.current?.click()}
          onReset={() => setImportStatus(idleImportStatus)}
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
                <p className="text-xs font-medium text-muted-foreground">
                  Ordem
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {nextRecommendation.routineOrder} de {activePlan.routines.length}
                </p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Ciclo
                </p>
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
              onClick={() => {
                void handleStartRecommendedWorkout();
              }}
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

        <section className="mt-5 rounded-lg border border-border bg-card p-4">
          <div className="mb-3">
            <h2 className="font-medium">Tema do app</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              A preferencia fica salva neste dispositivo.
            </p>
          </div>
          <ThemeSegmentedControl />
        </section>
          </>
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2">
          <NavItem active icon={Home} label="Inicio" />
          <NavItem icon={CalendarCheck2} label="Treino" />
          <NavItem icon={History} label="Historico" />
          <NavItem icon={Settings} label="Ajustes" />
        </div>
      </nav>
    </main>
  );
}

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

function ActiveWorkoutScreen({
  draft,
  loadHistoryByExerciseId,
  message,
  onCancel,
  onFinish,
  onUpdateSet,
}: ActiveWorkoutScreenProps) {
  return (
    <section className="mt-6 space-y-4">
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

      {draft.routine.exercises.map((exercise, exerciseIndex) => {
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
                  {exercise.muscleGroup}
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
        className="sticky bottom-20 h-14 w-full gap-3 text-base shadow-lg shadow-background"
        onClick={onFinish}
        type="button"
      >
        <Save className="h-5 w-5" aria-hidden="true" />
        Finalizar treino
      </Button>
    </section>
  );
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

function LoadHistoryPanel({
  summaries,
}: {
  summaries: ExerciseLoadSummary[];
}) {
  if (summaries.length === 0) {
    return (
      <section className="mt-5 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-info">Historico de cargas</p>
            <h2 className="font-semibold">Sem registros ainda</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Finalize um treino para ver ultima carga, maior carga e evolucao.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-info">Historico de cargas</p>
          <h2 className="font-semibold">Ultimos exercicios</h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {summaries.slice(0, 4).map((summary) => (
          <article className="rounded-md bg-muted p-3" key={summary.exerciseId}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-sm font-semibold">
                {summary.exerciseName}
              </h3>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {summary.completedSetsCount} series
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Ultima: </span>
                <span className="font-semibold">
                  {formatLoad(summary.lastLoadKg)} kg x {summary.lastReps}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Maior: </span>
                <span className="font-semibold">
                  {formatLoad(summary.maxLoadKg)} kg
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
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

function formatLoad(loadKg: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(loadKg);
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getRecommendationReasonLabel(
  reason: NextRoutineRecommendation["reason"],
) {
  if (reason === "first-workout") {
    return "Comece pela primeira rotina do plano ativo.";
  }

  if (reason === "cycle-restarted") {
    return "Ultima rotina concluida. O ciclo volta para o inicio.";
  }

  if (reason === "missing-last-routine") {
    return "Rotina anterior ausente. Recomendacao reiniciada pela primeira.";
  }

  return "Sequencia calculada a partir da ultima rotina finalizada.";
}

type ImportPanelProps = {
  importStatus: ImportStatus;
  onActivatePlan: () => void;
  onChooseAnotherFile: () => void;
  onReset: () => void;
};

function ImportPanel({
  importStatus,
  onActivatePlan,
  onChooseAnotherFile,
  onReset,
}: ImportPanelProps) {
  if (importStatus.state === "idle") {
    return (
      <section className="mt-5 grid gap-3">
        <InfoItem
          description="Escolha um arquivo local. A validacao acontece antes de salvar."
          icon={FileInput}
          title="Importar treino"
        />
        <InfoItem
          description="Use o arquivo base para pedir um novo plano compativel."
          icon={Download}
          title="Baixar modelo"
        />
      </section>
    );
  }

  if (importStatus.state === "error") {
    return (
      <section className="mt-5 rounded-lg border border-destructive bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-destructive">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-medium">JSON nao importado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {importStatus.fileName ?? "Arquivo selecionado"}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {importStatus.errors.slice(0, 4).map((error) => (
            <li
              className="text-sm leading-6"
              key={`${error.path}-${error.message}`}
            >
              <span className="font-medium">{error.path}:</span>{" "}
              <span className="text-muted-foreground">{error.message}</span>
            </li>
          ))}
        </ul>
        <Button
          className="mt-5 h-12 w-full gap-2"
          onClick={onChooseAnotherFile}
          type="button"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Tentar outro arquivo
        </Button>
      </section>
    );
  }

  const isSaving = importStatus.state === "saving";
  const isSaved = importStatus.state === "saved";

  return (
    <section className="mt-5 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          {isSaved ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <FileInput className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{importStatus.fileName}</p>
          <h2 className="mt-1 font-medium">
            {isSaved ? "Plano ativo atualizado" : "Preview do treino"}
          </h2>
        </div>
      </div>
      <PreviewSummary preview={importStatus.preview} />
      <div className="mt-5 grid gap-2">
        {!isSaved ? (
          <Button
            className="h-12 w-full gap-2"
            disabled={isSaving}
            onClick={onActivatePlan}
            type="button"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            {isSaving ? "Ativando..." : "Ativar novo plano"}
          </Button>
        ) : null}
        <Button
          className="h-12 w-full gap-2"
          onClick={isSaved ? onReset : onChooseAnotherFile}
          type="button"
          variant="secondary"
        >
          {isSaved ? "Fechar preview" : "Escolher outro JSON"}
        </Button>
      </div>
    </section>
  );
}

function PreviewSummary({ preview }: { preview: WorkoutPlanPreview }) {
  const summaryItems = [
    ["Objetivo", preview.objective],
    ["Nivel", preview.level],
    ["Duracao", `${preview.estimatedDurationWeeks} semanas`],
    ["Frequencia", `${preview.daysPerWeek} dias/semana`],
    ["Rotinas", String(preview.routineCount)],
    ["Exercicios", String(preview.exerciseCount)],
  ];

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold leading-tight">{preview.name}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        {summaryItems.map(([label, value]) => (
          <div className="rounded-md bg-muted p-3" key={label}>
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Ao ativar, o progresso da sequencia atual e reiniciado. Historicos de
        carga ja salvos permanecem no dispositivo.
      </p>
    </div>
  );
}

type InfoItemProps = {
  description: string;
  icon: typeof FileInput;
  title: string;
};

function InfoItem({ description, icon: Icon, title }: InfoItemProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

type NavItemProps = {
  active?: boolean;
  icon: typeof Home;
  label: string;
};

function NavItem({ active = false, icon: Icon, label }: NavItemProps) {
  return (
    <button
      className={[
        "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
        active ? "text-primary" : "text-muted-foreground",
      ].join(" ")}
      type="button"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
