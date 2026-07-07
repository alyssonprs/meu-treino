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
import {
  WorkoutFinishedScreen,
  type WorkoutCompletionSummary,
} from "@/features/workouts/WorkoutFinishedScreen";
import { RoutineListScreen } from "@/features/workouts/RoutineListScreen";
import {
  createLoadHistoryMap,
  getExerciseHistoryDetails,
  getCycleProgressSummary,
  getExerciseLoadSummaries,
  getRecentCompletedWorkoutSessions,
  getRoutineExecutionSummaries,
  type CompletedWorkoutSessionSummary,
  type ExerciseHistoryDetails,
  type ExerciseLoadSummary,
  type RoutineExecutionSummary,
} from "@/services/progressService";
import {
  autoExportCompletedWorkoutToHealthConnect,
} from "@/services/healthConnectExportService";
import {
  activateImportedWorkoutPlan,
  parseWorkoutPlanImport,
} from "@/services/workoutImportService";
import {
  parseLocalDataBackupJson,
  serializeLocalDataBackup,
} from "@/services/localBackupService";
import { getNextRecommendedRoutineFromSnapshot } from "@/services/workoutRecommendationService";
import {
  createWorkoutSessionDraft,
  finishWorkoutSession,
  markWorkoutSetCompletedInDraft,
  saveExerciseResultInDraft,
  setCurrentExerciseInDraft,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import { downloadTextFile, readTextFile } from "@/platform/files";
import { healthConnectAdapter } from "@/platform/health-connect";
import { pwaWorkoutPlanRepository } from "@/storage/pwa/dexieWorkoutPlanRepository";
import type {
  ActiveWorkoutPlanSnapshot,
  ExerciseLoadHistoryRecord,
  RoutineWithDetails,
  SaveCompletedWorkoutSessionInput,
} from "@/storage/workoutPlanRepository";

const appVersion = "0.1.0";

const mainTabHashByScreen: Record<MainTabScreen, string> = {
  history: "#/historico",
  home: "#/",
  settings: "#/ajustes",
  workout: "#/treino",
};

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>(
    () => getMainTabScreenFromHash() ?? "home",
  );
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
  const [recentSessions, setRecentSessions] = useState<
    CompletedWorkoutSessionSummary[]
  >([]);
  const [routineExecutionSummaries, setRoutineExecutionSummaries] = useState<
    RoutineExecutionSummary[]
  >([]);
  const [workoutMessage, setWorkoutMessage] = useState<string | null>(null);
  const [workoutCompletion, setWorkoutCompletion] =
    useState<WorkoutCompletionSummary | null>(null);
  const [importStatus, setImportStatus] =
    useState<ImportStatus>(idleImportStatus);
  const [isClearingLocalData, setIsClearingLocalData] = useState(false);

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
    function handleHashChange() {
      const nextScreen = getMainTabScreenFromHash();

      if (nextScreen) {
        setActiveScreen(nextScreen);
        setWorkoutMessage(null);
        setWorkoutCompletion(null);
      }
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!activePlan) {
      setLoadSummaries([]);
      setRecentSessions([]);
      setRoutineExecutionSummaries([]);
      return () => {
        isMounted = false;
      };
    }

    Promise.all([
      getExerciseLoadSummaries({
        activePlan,
        repository: pwaWorkoutPlanRepository,
      }),
      getRecentCompletedWorkoutSessions({
        repository: pwaWorkoutPlanRepository,
      }),
      getRoutineExecutionSummaries({
        activePlan,
        repository: pwaWorkoutPlanRepository,
      }),
    ]).then(([summaries, sessions, routineSummaries]) => {
      if (!isMounted) {
        return;
      }

      setLoadSummaries(summaries);
      setRecentSessions(sessions);
      setRoutineExecutionSummaries(routineSummaries);
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
    setWorkoutCompletion(null);

    if (window.location.hash !== mainTabHashByScreen[screen]) {
      window.location.hash = mainTabHashByScreen[screen];
    }
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
      window.location.hash = mainTabHashByScreen.home;
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

  function handleStartRecommendedWorkout() {
    if (!activePlan || !nextRecommendation) {
      return;
    }

    const routine = activePlan.routines.find(
      (currentRoutine) => currentRoutine.id === nextRecommendation.routineId,
    );

    if (routine) {
      void handleStartRoutineExercise(routine);
    }
  }

  function handleCancelImport() {
    setImportStatus(idleImportStatus);
    setActiveScreen("home");
    window.location.hash = mainTabHashByScreen.home;
  }

  async function handleStartRoutineExercise(
    routine: RoutineWithDetails,
    exerciseIndex = 0,
  ) {
    if (!activePlan) {
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
    setWorkoutMessage(null);
    setWorkoutCompletion({
      sessionId: result.sessionId,
      completedAt: result.completedAt,
      routineName: result.routineName,
      completedExercisesCount: result.completedExercisesCount,
      completedRecordsCount: result.completedRecordsCount,
      healthConnectExport: {
        status: "pending",
        message: "Verificando exportacao para Health Connect.",
      },
    });
    setActiveScreen("workout-finished");

    void exportCompletedWorkoutToHealthConnect({
      sessionId: result.sessionId,
      completedSession: result.completedSession,
    });
  }

  async function exportCompletedWorkoutToHealthConnect({
    sessionId,
    completedSession,
  }: {
    sessionId: string;
    completedSession: SaveCompletedWorkoutSessionInput;
  }) {
    const exportResult = await autoExportCompletedWorkoutToHealthConnect({
      sessionId,
      session: completedSession,
      adapter: healthConnectAdapter,
      getAutoExportEnabled: () =>
        pwaWorkoutPlanRepository.getHealthConnectAutoExportEnabled(),
    });

    setWorkoutCompletion((current) =>
      current?.sessionId === sessionId
        ? {
            ...current,
            healthConnectExport: exportResult,
          }
        : current,
    );
  }

  async function handleClearLocalData() {
    setIsClearingLocalData(true);

    try {
      await pwaWorkoutPlanRepository.clearAllWorkoutData();
      setActivePlan(null);
      setActiveWorkout(null);
      setWorkoutLoadHistory(new Map());
      setLoadSummaries([]);
      setRecentSessions([]);
      setRoutineExecutionSummaries([]);
      setWorkoutCompletion(null);
      setImportStatus(idleImportStatus);
      setWorkoutMessage("Dados de treino apagados deste dispositivo.");
      setActiveScreen("home");
      window.history.replaceState(null, "", mainTabHashByScreen.home);
    } catch {
      setWorkoutMessage("Nao foi possivel apagar os dados locais agora.");
    } finally {
      setIsClearingLocalData(false);
    }
  }

  function updateWorkoutExerciseResult({
    exerciseIndex,
    field,
    value,
  }: {
    exerciseIndex: number;
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
            result: { ...exercise.result, [field]: value },
          };
        }),
      };
    });
  }

  async function handleExportLocalBackup() {
    try {
      const backup = await pwaWorkoutPlanRepository.exportLocalDataBackup();
      const exportedDate = backup.exportedAt.slice(0, 10);

      downloadTextFile({
        contents: serializeLocalDataBackup(backup),
        fileName: `meu-treino-backup-${exportedDate}.json`,
        mimeType: "application/json",
      });

      return {
        success: true,
        message: "Backup baixado neste dispositivo.",
      };
    } catch {
      return {
        success: false,
        message: "Nao foi possivel gerar o backup agora.",
      };
    }
  }

  async function handleRestoreLocalBackupFile(file: File) {
    try {
      const text = await readTextFile(file);
      const result = parseLocalDataBackupJson(text);

      if (!result.success) {
        return {
          success: false,
          message: "O arquivo selecionado nao e um backup valido.",
          details: result.errors
            .slice(0, 3)
            .map((error) => `${error.path}: ${error.message}`),
        };
      }

      await pwaWorkoutPlanRepository.restoreLocalDataBackup(result.backup);
      const restoredPlan = await pwaWorkoutPlanRepository.getActivePlan();

      setActivePlan(restoredPlan);
      setActiveWorkout(null);
      setWorkoutLoadHistory(new Map());
      setWorkoutCompletion(null);
      setImportStatus(idleImportStatus);
      setWorkoutMessage("Backup restaurado com sucesso.");

      return {
        success: true,
        message: "Backup restaurado com plano e historico.",
      };
    } catch {
      return {
        success: false,
        message: "Nao foi possivel restaurar este backup agora.",
      };
    }
  }

  function markWorkoutSetCompleted({
    exerciseIndex,
    setIndex,
  }: {
    exerciseIndex: number;
    setIndex: number;
  }) {
    setActiveWorkout((current) => {
      if (!current) {
        return current;
      }

      return markWorkoutSetCompletedInDraft({
        draft: current,
        exerciseIndex,
        setIndex,
        completedAt: new Date().toISOString(),
      });
    });
  }

  function saveWorkoutExerciseResult({
    exerciseIndex,
    values,
  }: {
    exerciseIndex: number;
    values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  }) {
    setActiveWorkout((current) => {
      if (!current) {
        return current;
      }

      return saveExerciseResultInDraft({
        draft: current,
        exerciseIndex,
        values,
        savedAt: new Date().toISOString(),
      });
    });
  }

  return (
    <AppShell
      activeScreen={activeScreen}
      onNavigate={navigateToMainTab}
    >
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
            navigateToMainTab("workout");
          }}
          onFinish={() => {
            void handleFinishWorkout();
          }}
          onMarkSetCompleted={markWorkoutSetCompleted}
          onSaveExerciseResult={saveWorkoutExerciseResult}
          onSelectExercise={(exerciseIndex) => {
            setActiveWorkout((current) =>
              current
                ? setCurrentExerciseInDraft({ draft: current, exerciseIndex })
                : current,
            );
          }}
          onUpdateExerciseResult={updateWorkoutExerciseResult}
        />
      );
    }

    if (activeScreen === "workout-finished" && workoutCompletion) {
      const finishedCycleProgress = activePlan
        ? getCycleProgressSummary(activePlan)
        : null;
      const finishedNextRecommendation = activePlan
        ? getNextRecommendedRoutineFromSnapshot(activePlan)
        : null;

      return (
        <WorkoutFinishedScreen
          completion={workoutCompletion}
          cycleProgress={finishedCycleProgress}
          nextRecommendation={finishedNextRecommendation}
          onGoHome={() => navigateToMainTab("home")}
          onGoToHistory={() => navigateToMainTab("history")}
        />
      );
    }

    if (activeScreen === "workout") {
      return (
        <RoutineListScreen
          activePlan={activePlan}
          nextRecommendation={nextRecommendation}
          onOpenRoutine={(routineId) => {
            const routine = activePlan?.routines.find(
              (currentRoutine) => currentRoutine.id === routineId,
            );

            if (routine) {
              void handleStartRoutineExercise(routine);
            }
          }}
          routineExecutionSummaries={routineExecutionSummaries}
        />
      );
    }

    if (activeScreen === "history") {
      return (
        <ProgressScreen
          activePlan={activePlan}
          cycleProgress={cycleProgress}
          loadSummaries={loadSummaries}
          recentSessions={recentSessions}
          onLoadExerciseHistory={(exerciseId) =>
            loadExerciseHistoryDetails(exerciseId)
          }
        />
      );
    }

    if (activeScreen === "settings") {
      return (
        <SettingsScreen
          activePlan={activePlan}
          appVersion={appVersion}
          healthConnectAdapter={healthConnectAdapter}
          isClearingLocalData={isClearingLocalData}
          getHealthConnectAutoExportEnabled={() =>
            pwaWorkoutPlanRepository.getHealthConnectAutoExportEnabled()
          }
          onChooseImportFile={() => fileInputRef.current?.click()}
          onClearLocalData={handleClearLocalData}
          onExportLocalBackup={handleExportLocalBackup}
          onRestoreLocalBackupFile={handleRestoreLocalBackupFile}
          setHealthConnectAutoExportEnabled={(enabled) =>
            pwaWorkoutPlanRepository.setHealthConnectAutoExportEnabled(enabled)
          }
        />
      );
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
          onCancelImport={handleCancelImport}
          onChooseAnotherFile={() => fileInputRef.current?.click()}
        />
      );
    }

    if (activeScreen === "import-error" && importStatus.state === "error") {
      return (
        <ImportErrorScreen
          importStatus={importStatus}
          onCancelImport={handleCancelImport}
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
        onOpenWorkoutList={() => navigateToMainTab("workout")}
        onStartRecommendedWorkout={handleStartRecommendedWorkout}
      />
    );
  }

  async function loadExerciseHistoryDetails(
    exerciseId: string,
  ): Promise<ExerciseHistoryDetails | null> {
    if (!activePlan) {
      return null;
    }

    return getExerciseHistoryDetails({
      activePlan,
      exerciseId,
      repository: pwaWorkoutPlanRepository,
    });
  }
}

function getMainTabScreenFromHash(): MainTabScreen | null {
  const hashPath = window.location.hash.replace(/^#\/?/, "");

  if (hashPath === "" || hashPath === "/") {
    return "home";
  }

  if (hashPath === "treino") {
    return "workout";
  }

  if (hashPath === "historico") {
    return "history";
  }

  if (hashPath === "ajustes") {
    return "settings";
  }

  return null;
}
