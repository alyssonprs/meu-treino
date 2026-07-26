import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Square } from "lucide-react";
import { HomeScreen } from "@/features/home/HomeScreen";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
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
import { mainTabHashByScreen } from "@/features/navigation/appNavigation";
import {
  ExerciseHistoryScreen,
  ProgressScreen,
} from "@/features/progress/ProgressScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { ActiveExerciseScreen } from "@/features/workouts/ActiveExerciseScreen";
import { ActiveWorkoutScreen } from "@/features/workouts/ActiveWorkoutScreen";
import { FloatingRestTimer } from "@/features/workouts/FloatingRestTimer";
import {
  getRestTimerRemainingSeconds,
  type ActiveRestTimer,
} from "@/features/workouts/restTimer";
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
  getNextPendingSetIndex,
  markWorkoutSetCompletedInDraft,
  saveExerciseResultInDraft,
  setCurrentExerciseInDraft,
  type WorkoutSessionDraft,
  type WorkoutSetDraft,
} from "@/services/workoutSessionService";
import { downloadTextFile, readTextFile } from "@/platform/files";
import { healthConnectAdapter } from "@/platform/health-connect";
import {
  playRestCountdownFeedback,
  playRestFinishedFeedback,
  prepareRestTimerFeedback,
} from "@/platform/restTimerFeedback";
import { pwaWorkoutPlanRepository } from "@/storage/pwa/dexieWorkoutPlanRepository";
import type {
  ActiveWorkoutPlanSnapshot,
  ExerciseLoadHistoryRecord,
  RoutineWithDetails,
  SaveCompletedWorkoutSessionInput,
} from "@/storage/workoutPlanRepository";

const appVersion = "0.1.0";

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
  const [activeRestTimer, setActiveRestTimer] =
    useState<ActiveRestTimer | null>(null);
  const [restTimerNow, setRestTimerNow] = useState(() => Date.now());
  const lastRestFeedbackKeyRef = useRef<string | null>(null);
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
  const [importOrigin, setImportOrigin] = useState<MainTabScreen>("home");
  const [isClearingLocalData, setIsClearingLocalData] = useState(false);
  const [selectedHistoryExerciseDetails, setSelectedHistoryExerciseDetails] =
    useState<ExerciseHistoryDetails | null>(null);
  const [isLoadingHistoryExerciseDetails, setIsLoadingHistoryExerciseDetails] =
    useState(false);
  const [showFinishWorkoutConfirmation, setShowFinishWorkoutConfirmation] =
    useState(false);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeScreen]);

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
    if (!getScreenFromHash()) {
      window.history.replaceState({ screen: "home" }, "", mainTabHashByScreen.home);
    }

    function handleHashChange() {
      const nextScreen = getMainTabScreenFromHash();

      if (nextScreen) {
        setActiveScreen(nextScreen);
        setSelectedHistoryExerciseDetails(null);
        setWorkoutMessage(null);
        setWorkoutCompletion(null);
      }
    }

    function handlePopState() {
      const destination = getScreenFromHash();

      if (destination) {
        setActiveScreen(destination);
        setSelectedHistoryExerciseDetails(null);
        setWorkoutMessage(null);
        setWorkoutCompletion(null);
        if (destination === "import-preview" || destination === "import-error") {
          setImportStatus(idleImportStatus);
        }
        return;
      }

      setActiveScreen("home");
      window.history.replaceState({ screen: "home" }, "", mainTabHashByScreen.home);
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handlePopState);
    };
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
  const restTimerRemainingSeconds = activeRestTimer
    ? getRestTimerRemainingSeconds(activeRestTimer, restTimerNow)
    : null;
  const restTimerExercise =
    activeRestTimer && activeWorkout
      ? activeWorkout.routine.exercises[activeRestTimer.exerciseIndex]
      : null;

  useEffect(() => {
    if (!activeRestTimer) {
      return;
    }

    const updateNow = () => setRestTimerNow(Date.now());
    const updateNowWhenAppReturns = () => {
      // Android can pause WebView timers while the app is in the background.
      // The countdown itself is based on endsAt, so refresh immediately when
      // the app becomes visible again instead of waiting for setInterval.
      updateNow();
    };

    updateNow();
    const intervalId = window.setInterval(updateNow, 500);
    document.addEventListener("visibilitychange", updateNowWhenAppReturns);
    window.addEventListener("pageshow", updateNowWhenAppReturns);
    window.addEventListener("focus", updateNowWhenAppReturns);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", updateNowWhenAppReturns);
      window.removeEventListener("pageshow", updateNowWhenAppReturns);
      window.removeEventListener("focus", updateNowWhenAppReturns);
    };
  }, [activeRestTimer]);

  useEffect(() => {
    if (
      !activeRestTimer ||
      restTimerRemainingSeconds === null ||
      restTimerRemainingSeconds > 3
    ) {
      return;
    }

    const feedbackKey = `${activeRestTimer.endsAt}:${restTimerRemainingSeconds}`;

    if (lastRestFeedbackKeyRef.current === feedbackKey) {
      return;
    }

    lastRestFeedbackKeyRef.current = feedbackKey;

    if (restTimerRemainingSeconds === 0) {
      playRestFinishedFeedback();
      return;
    }

    playRestCountdownFeedback(restTimerRemainingSeconds);
  }, [activeRestTimer, restTimerRemainingSeconds]);

  function navigateToMainTab(
    screen: MainTabScreen,
    options: { replace?: boolean } = {},
  ) {
    setActiveScreen(screen);
    setSelectedHistoryExerciseDetails(null);
    setWorkoutMessage(null);
    setWorkoutCompletion(null);

    if (window.location.hash !== mainTabHashByScreen[screen]) {
      const method = options.replace ? "replaceState" : "pushState";
      window.history[method](null, "", mainTabHashByScreen[screen]);
    }
  }

  function openContextualScreen(screen: AppScreen) {
    setActiveScreen(screen);
    window.history.pushState({ screen }, "", getContextualHash(screen));
  }

  function navigateBackFromContext() {
    if (getScreenFromHash() && window.history.length > 1) {
      window.history.back();
      return;
    }

    setActiveScreen("home");
    window.history.replaceState({ screen: "home" }, "", mainTabHashByScreen.home);
  }

  function requestImportFile(origin: MainTabScreen) {
    setImportOrigin(origin);
    fileInputRef.current?.click();
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
        openContextualScreen("import-error");
        return;
      }

      setImportStatus({
        state: "preview",
        fileName,
        preview: result.preview,
        errors: [],
      });
      openContextualScreen("import-preview");
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
      openContextualScreen("import-error");
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
      setActiveWorkout(null);
      setActiveRestTimer(null);
      setWorkoutLoadHistory(new Map());
      setImportStatus(idleImportStatus);
      navigateToMainTab("home", { replace: true });
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
      openContextualScreen("import-error");
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
    navigateToMainTab(importOrigin);
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
      openContextualScreen("active-workout");
      return;
    }

    const history = await pwaWorkoutPlanRepository.getExerciseLoadHistory(
      routine.exercises.map((exercise) => exercise.exerciseId),
    );
    const loadHistoryByExerciseId = createLoadHistoryMap(history);

    setWorkoutLoadHistory(loadHistoryByExerciseId);
    setActiveRestTimer(null);
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
    openContextualScreen("active-workout");
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
    setActiveRestTimer(null);
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
    openContextualScreen("workout-finished");

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
      setActiveRestTimer(null);
      setWorkoutLoadHistory(new Map());
      setLoadSummaries([]);
      setRecentSessions([]);
      setRoutineExecutionSummaries([]);
      setWorkoutCompletion(null);
      setImportStatus(idleImportStatus);
      navigateToMainTab("home", { replace: true });
      setWorkoutMessage("Dados de treino apagados deste dispositivo.");
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
      setActiveRestTimer(null);
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
    const exercise = activeWorkout?.routine.exercises[exerciseIndex];
    const exerciseDraft = activeWorkout?.exercises[exerciseIndex];
    const isValidPendingSet =
      exerciseDraft?.completedSets[setIndex]?.completedAt === null;
    const hasNextSet =
      isValidPendingSet && setIndex + 1 < (exerciseDraft?.completedSets.length ?? 0);

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

    if (!isValidPendingSet || !exercise) {
      return;
    }

    if (!hasNextSet) {
      setActiveRestTimer(null);
      return;
    }

    prepareRestTimerFeedback();
    setActiveRestTimer({
      exerciseIndex,
      nextSetIndex: setIndex + 1,
      endsAt: Date.now() + (exercise.rest_seconds ?? 90) * 1000,
    });
  }

  function openWorkoutExercise(exerciseIndex: number) {
    setActiveWorkout((current) =>
      current
        ? setCurrentExerciseInDraft({ draft: current, exerciseIndex })
        : current,
    );
    setWorkoutMessage(null);
    openContextualScreen("active-exercise");
  }

  function openRestTimerExercise() {
    if (!activeRestTimer) {
      return;
    }

    if (getRestTimerRemainingSeconds(activeRestTimer) === 0) {
      setActiveRestTimer(null);
    }

    openWorkoutExercise(activeRestTimer.exerciseIndex);
  }

  function requestFinishWorkout() {
    if (!activeWorkout) {
      return;
    }

    const completedExercises = getCompletedWorkoutExerciseCount(activeWorkout);

    if (completedExercises < activeWorkout.exercises.length) {
      setShowFinishWorkoutConfirmation(true);
      return;
    }

    void handleFinishWorkout();
  }

  function getCurrentContextualHeader() {
    if (activeScreen === "active-workout" && activeWorkout) {
      return {
        backLabel: "Voltar para lista de rotinas",
        label: activeWorkout.routine.name,
        meta: (
          <span className="shrink-0 rounded-full bg-md-surface-container-high px-3 py-2 text-label-md font-medium tabular-nums text-md-on-surface-variant">
            {getCompletedWorkoutExerciseCount(activeWorkout)}/{activeWorkout.exercises.length}
          </span>
        ),
        onBack: () => navigateBackFromContext(),
        title: "Treino em andamento",
      };
    }

    if (activeScreen === "active-exercise" && activeWorkout) {
      const exercise =
        activeWorkout.routine.exercises[activeWorkout.currentExerciseIndex];

      return {
        backLabel: "Voltar para lista de exercícios",
        label: activeWorkout.routine.name,
        meta: (
          <span className="shrink-0 rounded-full bg-md-surface-container-high px-3 py-2 text-label-md font-medium tabular-nums text-md-on-surface-variant">
            {activeWorkout.currentExerciseIndex + 1}/{activeWorkout.exercises.length}
          </span>
        ),
        onBack: () => navigateBackFromContext(),
        title: exercise?.name ?? "Exercício",
      };
    }

    if (activeScreen === "import-preview") {
      return {
        backLabel: "Voltar para origem da importação",
        label: "Importação",
        onBack: () => navigateBackFromContext(),
        title: "Preview do JSON",
      };
    }

    if (activeScreen === "import-error") {
      return {
        backLabel: "Voltar para origem da importação",
        label: "Importação",
        onBack: () => navigateBackFromContext(),
        title: "JSON não importado",
      };
    }

    if (activeScreen === "history-detail") {
      return {
        backLabel: "Voltar para histórico",
        label: "Histórico",
        onBack: () => navigateBackFromContext(),
        title: selectedHistoryExerciseDetails?.exerciseName ?? "Detalhe do exercício",
      };
    }

    if (activeScreen === "workout-finished") {
      return {
        label: "Resultado",
        title: "Treino concluído",
      };
    }

    return undefined;
  }

  function getCurrentBottomAction() {
    if (activeScreen === "active-workout" && activeWorkout) {
      const hasIncompleteExercises =
        getCompletedWorkoutExerciseCount(activeWorkout) < activeWorkout.exercises.length;

      return (
        <Button className="h-14 w-full gap-2 font-semibold leading-5 text-md-on-primary" onClick={requestFinishWorkout} type="button" variant="filled">
          <Square className="h-5 w-5" aria-hidden="true" />
          {hasIncompleteExercises ? "Finalizar treino" : "Finalizar rotina"}
        </Button>
      );
    }

    if (activeScreen === "active-exercise" && activeWorkout) {
      const exerciseIndex = activeWorkout.currentExerciseIndex;
      const exerciseDraft = activeWorkout.exercises[exerciseIndex];
      const currentSetIndex = getNextPendingSetIndex(activeWorkout, exerciseIndex);
      const isRegistered = exerciseDraft?.result.completedAt !== null;
      const areAllSetsCompleted = exerciseDraft !== undefined && currentSetIndex === null;

      if (!exerciseDraft || isRegistered || areAllSetsCompleted) {
        return undefined;
      }

      const nextSetIndex =
        activeRestTimer?.exerciseIndex === exerciseIndex
          ? activeRestTimer.nextSetIndex
          : currentSetIndex;

      if (nextSetIndex === null || nextSetIndex === undefined) {
        return undefined;
      }

      return (
        <Button
          aria-label={`Concluir série ${nextSetIndex + 1}`}
          className="h-14 w-full gap-3 font-semibold leading-5 text-md-on-primary"
          onClick={() => markWorkoutSetCompleted({ exerciseIndex, setIndex: nextSetIndex })}
          type="button"
        >
          <Check className="h-5 w-5" aria-hidden="true" />
          Concluir série
        </Button>
      );
    }

    return undefined;
  }

  function saveWorkoutExerciseResult({
    exerciseIndex,
    values,
  }: {
    exerciseIndex: number;
    values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  }) {
    setActiveRestTimer((current) =>
      current?.exerciseIndex === exerciseIndex ? null : current,
    );
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

  const contextualHeader = getCurrentContextualHeader();
  const bottomAction = getCurrentBottomAction();

  return (
    <AppShell
      activeScreen={activeScreen}
      bottomAction={bottomAction}
      contextualHeader={contextualHeader}
      floatingOverlay={
        activeRestTimer && restTimerExercise && restTimerRemainingSeconds !== null ? (
          <FloatingRestTimer
            exerciseName={restTimerExercise.name}
            remainingSeconds={restTimerRemainingSeconds}
            onOpenExercise={openRestTimerExercise}
          />
        ) : undefined
      }
      onNavigate={navigateToMainTab}
    >
      {renderCurrentScreen()}
      <ConfirmationDialog
        confirmLabel="Entendi"
        isOpen={workoutMessage !== null}
        onConfirm={() => setWorkoutMessage(null)}
        title={isPositiveWorkoutMessage(workoutMessage) ? "Atualização concluída" : "Não foi possível concluir"}
        tone={isPositiveWorkoutMessage(workoutMessage) ? "success" : "danger"}
      >
        {workoutMessage ?? ""}
      </ConfirmationDialog>
      <ConfirmationDialog
        cancelLabel="Continuar treino"
        confirmLabel="Finalizar treino"
        isOpen={showFinishWorkoutConfirmation}
        onCancel={() => setShowFinishWorkoutConfirmation(false)}
        onConfirm={() => {
          setShowFinishWorkoutConfirmation(false);
          void handleFinishWorkout();
        }}
        title="Finalizar treino incompleto?"
        tone="warning"
      >
        Ainda há exercícios sem registro. Finalize somente se o treino acabou por hoje.
      </ConfirmationDialog>
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
          onOpenExercise={openWorkoutExercise}
        />
      );
    }

    if (activeScreen === "active-exercise" && activeWorkout) {
      return (
        <ActiveExerciseScreen
          draft={activeWorkout}
          loadHistoryByExerciseId={workoutLoadHistory}
          onBackToList={() => navigateBackFromContext()}
          onFinish={() => {
            void handleFinishWorkout();
          }}
          onOpenExercise={openWorkoutExercise}
          onSaveExerciseResult={saveWorkoutExerciseResult}
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
          onOpenExerciseHistory={(exerciseId) => {
            void openHistoryExerciseDetails(exerciseId);
          }}
        />
      );
    }

    if (activeScreen === "history-detail") {
      return (
        <ExerciseHistoryScreen
          details={selectedHistoryExerciseDetails}
          isLoading={isLoadingHistoryExerciseDetails}
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
          onChooseImportFile={() => requestImportFile("settings")}
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
        onChooseImportFile={() => requestImportFile("home")}
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

  async function openHistoryExerciseDetails(exerciseId: string) {
    setSelectedHistoryExerciseDetails(null);
    setIsLoadingHistoryExerciseDetails(true);
    openContextualScreen("history-detail");

    try {
      setSelectedHistoryExerciseDetails(await loadExerciseHistoryDetails(exerciseId));
    } finally {
      setIsLoadingHistoryExerciseDetails(false);
    }
  }
}

function isPositiveWorkoutMessage(message: string | null) {
  return (
    message?.includes("com sucesso") ||
    message?.startsWith("Dados de treino apagados") ||
    false
  );
}

function getContextualHash(screen: AppScreen) {
  const hashByScreen: Partial<Record<AppScreen, string>> = {
    "active-exercise": "#/treino/exercicio",
    "active-workout": "#/treino/ativo",
    "history-detail": "#/historico/exercicio",
    "import-error": "#/importar/erro",
    "import-preview": "#/importar/preview",
    "workout-finished": "#/treino/concluido",
  };

  return hashByScreen[screen] ?? window.location.hash;
}

function getScreenFromHash(): AppScreen | null {
  const mainScreen = getMainTabScreenFromHash();

  if (mainScreen) {
    return mainScreen;
  }

  const contextualScreenByHash: Record<string, AppScreen> = {
    "#/treino/exercicio": "active-exercise",
    "#/treino/ativo": "active-workout",
    "#/historico/exercicio": "history-detail",
    "#/importar/erro": "import-error",
    "#/importar/preview": "import-preview",
    "#/treino/concluido": "workout-finished",
  };

  return contextualScreenByHash[window.location.hash] ?? null;
}

function getCompletedWorkoutExerciseCount(workout: WorkoutSessionDraft) {
  return workout.exercises.filter((exercise) => exercise.result.completedAt !== null)
    .length;
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
