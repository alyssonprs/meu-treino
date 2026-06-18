import { useEffect, useRef, useState } from "react";
import { HomeScreen } from "@/features/home/HomeScreen";
import {
  idleImportStatus,
  type ImportStatus,
} from "@/features/import-export/importStatus";
import { ImportErrorScreen } from "@/features/import-export/ImportErrorScreen";
import { ImportPreviewScreen } from "@/features/import-export/ImportPreviewScreen";
import { AppShell } from "@/features/navigation/AppShell";
import type {
  AppScreen,
  MainTabScreen,
} from "@/features/navigation/appNavigation";
import { ProgressScreen } from "@/features/progress/ProgressScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { ActiveWorkoutScreen } from "@/features/workouts/ActiveWorkoutScreen";
import { WorkoutScreen } from "@/features/workouts/WorkoutScreen";
import {
  createLoadHistoryMap,
  getCycleProgressSummary,
  getExerciseLoadSummaries,
  type ExerciseLoadSummary,
} from "@/services/progressService";
import {
  activateImportedWorkoutPlan,
  parseWorkoutPlanImport,
} from "@/services/workoutImportService";
import { getNextRecommendedRoutineFromSnapshot } from "@/services/workoutRecommendationService";
import {
  createWorkoutSessionDraft,
  finishWorkoutSession,
  saveWorkoutSetInDraft,
  setCurrentExerciseInDraft,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import { pwaWorkoutPlanRepository } from "@/storage/pwa/dexieWorkoutPlanRepository";
import type {
  ActiveWorkoutPlanSnapshot,
  ExerciseLoadHistoryRecord,
} from "@/storage/workoutPlanRepository";

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>("home");
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

  const nextRecommendation = activePlan
    ? getNextRecommendedRoutineFromSnapshot(activePlan)
    : null;
  const cycleProgress = activePlan
    ? getCycleProgressSummary(activePlan)
    : null;

  function navigateToMainTab(screen: MainTabScreen) {
    setActiveScreen(screen);
    setWorkoutMessage(null);
  }

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
        setActiveScreen("import-error");
        return;
      }

      setImportStatus({
        state: "preview",
        fileName,
        preview: result.preview,
        errors: [],
      });
      setActiveScreen("import-preview");
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
      setActiveScreen("import-error");
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
      setImportStatus(idleImportStatus);
      setActiveScreen("home");
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

  function handleOpenRecommendedWorkoutDetail() {
    if (!activePlan || !nextRecommendation) {
      return;
    }

    setWorkoutMessage(null);
    setActiveScreen("workout");
  }

  async function handleStartRecommendedWorkout(exerciseIndex = 0) {
    if (!activePlan || !nextRecommendation) {
      return;
    }

    const routine = activePlan.routines.find(
      (item) => item.id === nextRecommendation.routineId,
    );

    if (!routine) {
      return;
    }

    if (activeWorkout?.routine.id === routine.id) {
      setActiveWorkout(
        setCurrentExerciseInDraft({ draft: activeWorkout, exerciseIndex }),
      );
      setWorkoutMessage(null);
      setActiveScreen("active-workout");
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
        initialExerciseIndex: exerciseIndex,
      }),
    );
    setActiveScreen("active-workout");
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
    setActiveScreen("home");
  }

  function updateWorkoutSet({
    exerciseIndex,
    setIndex,
    field,
    value,
  }: {
    exerciseIndex: number;
    setIndex: number;
    field: keyof Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
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

  function saveWorkoutSet({
    exerciseIndex,
    setIndex,
    values,
  }: {
    exerciseIndex: number;
    setIndex: number;
    values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  }) {
    setActiveWorkout((current) => {
      if (!current) {
        return current;
      }

      return saveWorkoutSetInDraft({
        draft: current,
        exerciseIndex,
        setIndex,
        values,
        savedAt: new Date().toISOString(),
      });
    });
  }

  return (
    <AppShell activeScreen={activeScreen} onNavigate={navigateToMainTab}>
      {renderCurrentScreen()}
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
    </AppShell>
  );

  function renderCurrentScreen() {
    if (activeScreen === "active-workout" && activeWorkout) {
      return (
        <ActiveWorkoutScreen
          draft={activeWorkout}
          loadHistoryByExerciseId={workoutLoadHistory}
          message={workoutMessage}
          onBackToDetail={() => {
            setWorkoutMessage(null);
            setActiveScreen("workout");
          }}
          onCancel={() => {
            setActiveWorkout(null);
            setWorkoutMessage(null);
            setActiveScreen("workout");
          }}
          onFinish={() => {
            void handleFinishWorkout();
          }}
          onSaveSet={saveWorkoutSet}
          onSelectExercise={(exerciseIndex) => {
            setActiveWorkout((current) =>
              current
                ? setCurrentExerciseInDraft({ draft: current, exerciseIndex })
                : current,
            );
          }}
          onUpdateSet={updateWorkoutSet}
        />
      );
    }

    if (activeScreen === "workout") {
      return (
        <WorkoutScreen
          activePlan={activePlan}
          loadSummaries={loadSummaries}
          nextRecommendation={nextRecommendation}
          onStartExercise={(exerciseIndex) => {
            void handleStartRecommendedWorkout(exerciseIndex);
          }}
        />
      );
    }

    if (activeScreen === "history") {
      return <ProgressScreen loadSummaries={loadSummaries} />;
    }

    if (activeScreen === "settings") {
      return <SettingsScreen />;
    }

    if (
      activeScreen === "import-preview" &&
      (importStatus.state === "preview" || importStatus.state === "saving")
    ) {
      return (
        <ImportPreviewScreen
          importStatus={importStatus}
          onActivatePlan={() => {
            void handleActivatePlan();
          }}
          onChooseAnotherFile={() => fileInputRef.current?.click()}
        />
      );
    }

    if (activeScreen === "import-error" && importStatus.state === "error") {
      return (
        <ImportErrorScreen
          importStatus={importStatus}
          onChooseAnotherFile={() => fileInputRef.current?.click()}
        />
      );
    }

    return (
      <HomeScreen
        activePlan={activePlan}
        cycleProgress={cycleProgress}
        isLoadingActivePlan={isLoadingActivePlan}
        loadSummaries={loadSummaries}
        nextRecommendation={nextRecommendation}
        workoutMessage={workoutMessage}
        onChooseImportFile={() => fileInputRef.current?.click()}
        onGoToHistory={() => navigateToMainTab("history")}
        onOpenWorkoutDetail={handleOpenRecommendedWorkoutDetail}
      />
    );
  }
}
