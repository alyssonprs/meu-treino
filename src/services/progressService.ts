import type {
  ActiveWorkoutPlanSnapshot,
  CompletedWorkoutSessionSummaryRecord,
  ExerciseLoadHistoryRecord,
  ExerciseSetHistoryRecord,
  RoutineExecutionSummaryRecord,
  WorkoutPlanRepository,
} from "@/storage/workoutPlanRepository";

export type ExerciseLoadSummary = {
  exerciseId: string;
  exerciseName: string;
  lastLoadKg: number;
  maxLoadKg: number;
  lastReps: number;
  lastRir: number | null;
  completedSetsCount: number;
  updatedAt: string;
};

export type CycleProgressSummary = {
  completedSessions: number;
  plannedSessions: number;
  percentage: number;
  remainingSessions: number;
  isComplete: boolean;
};

export type CompletedWorkoutSessionSummary = {
  id: string;
  routineName: string;
  completedAt: string;
  exercisesCount: number;
  setsCount: number;
};

export type RoutineExecutionSummary = {
  routineId: string;
  routineName: string;
  routineOrder: number;
  completedSessionsCount: number;
  lastCompletedAt: string | null;
};

export type ExerciseSetHistoryEntry = {
  id: string;
  sessionId: string;
  routineName: string;
  completedAt: string;
  setNumber: number;
  loadKg: number;
  reps: number;
  rir: number | null;
  notes: string | null;
};

export type ExerciseHistoryDetails = {
  exerciseId: string;
  exerciseName: string;
  lastLoadKg: number;
  maxLoadKg: number;
  lastReps: number;
  lastRir: number | null;
  completedSetsCount: number;
  updatedAt: string;
  records: ExerciseSetHistoryEntry[];
};

export function getCycleProgressSummary(
  activePlan: ActiveWorkoutPlanSnapshot,
): CycleProgressSummary {
  const plannedSessions =
    activePlan.plan.estimatedDurationWeeks * activePlan.plan.daysPerWeek;
  const completedSessions = activePlan.progress.completedSessionsCount;
  const percentage =
    plannedSessions > 0
      ? Math.min(100, Math.round((completedSessions / plannedSessions) * 100))
      : 0;

  return {
    completedSessions,
    plannedSessions,
    percentage,
    remainingSessions: Math.max(0, plannedSessions - completedSessions),
    isComplete: completedSessions >= plannedSessions,
  };
}

export async function getExerciseLoadSummaries({
  activePlan,
  repository,
}: {
  activePlan: ActiveWorkoutPlanSnapshot;
  repository: Pick<WorkoutPlanRepository, "getExerciseLoadHistory">;
}): Promise<ExerciseLoadSummary[]> {
  const plannedExerciseIds = activePlan.routines.flatMap((routine) =>
    routine.exercises.map((exercise) => exercise.exerciseId),
  );
  const history = await repository.getExerciseLoadHistory(plannedExerciseIds);
  const activeExerciseNames = new Map(
    activePlan.routines.flatMap((routine) =>
      routine.exercises.map((exercise) => [exercise.exerciseId, exercise.name]),
    ),
  );

  return history
    .map((item) => toSummary(item, activeExerciseNames))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getRecentCompletedWorkoutSessions({
  repository,
  limit = 5,
}: {
  repository: Pick<WorkoutPlanRepository, "getRecentCompletedWorkoutSessions">;
  limit?: number;
}): Promise<CompletedWorkoutSessionSummary[]> {
  const sessions = await repository.getRecentCompletedWorkoutSessions(limit);

  return sessions.map(toSessionSummary);
}

export async function getRoutineExecutionSummaries({
  activePlan,
  repository,
}: {
  activePlan: ActiveWorkoutPlanSnapshot;
  repository: Pick<WorkoutPlanRepository, "getRoutineExecutionSummaries">;
}): Promise<RoutineExecutionSummary[]> {
  const summaries = await repository.getRoutineExecutionSummaries(
    activePlan.plan.id,
  );
  const summaryByRoutineId = new Map(
    summaries.map((summary) => [summary.routineId, summary]),
  );

  return [...activePlan.routines]
    .sort((left, right) => left.order - right.order)
    .map((routine) => {
      const summary = summaryByRoutineId.get(routine.id);

      return summary
        ? toRoutineExecutionSummary(summary)
        : {
            routineId: routine.id,
            routineName: routine.name,
            routineOrder: routine.order,
            completedSessionsCount: 0,
            lastCompletedAt: null,
          };
    });
}

export async function getExerciseHistoryDetails({
  activePlan,
  exerciseId,
  repository,
}: {
  activePlan: ActiveWorkoutPlanSnapshot;
  exerciseId: string;
  repository: Pick<
    WorkoutPlanRepository,
    "getExerciseLoadHistory" | "getExerciseSetHistory"
  >;
}): Promise<ExerciseHistoryDetails | null> {
  const [loadHistory] = await repository.getExerciseLoadHistory([exerciseId]);

  if (!loadHistory) {
    return null;
  }

  const records = await repository.getExerciseSetHistory(exerciseId, 30);
  const activeExerciseName = activePlan.routines
    .flatMap((routine) => routine.exercises)
    .find((exercise) => exercise.exerciseId === exerciseId)?.name;

  return {
    exerciseId,
    exerciseName: activeExerciseName ?? loadHistory.exerciseName,
    lastLoadKg: loadHistory.lastLoadKg,
    maxLoadKg: loadHistory.maxLoadKg,
    lastReps: loadHistory.lastReps,
    lastRir: loadHistory.lastRir,
    completedSetsCount: loadHistory.completedSetsCount,
    updatedAt: loadHistory.updatedAt,
    records: records.map(toExerciseSetHistoryEntry),
  };
}

export function createLoadHistoryMap(
  history: ExerciseLoadHistoryRecord[],
): Map<string, ExerciseLoadHistoryRecord> {
  return new Map(history.map((item) => [item.exerciseId, item]));
}

function toSummary(
  item: ExerciseLoadHistoryRecord,
  activeExerciseNames: Map<string, string>,
): ExerciseLoadSummary {
  return {
    exerciseId: item.exerciseId,
    exerciseName: activeExerciseNames.get(item.exerciseId) ?? item.exerciseName,
    lastLoadKg: item.lastLoadKg,
    maxLoadKg: item.maxLoadKg,
    lastReps: item.lastReps,
    lastRir: item.lastRir,
    completedSetsCount: item.completedSetsCount,
    updatedAt: item.updatedAt,
  };
}

function toSessionSummary(
  session: CompletedWorkoutSessionSummaryRecord,
): CompletedWorkoutSessionSummary {
  return {
    id: session.id,
    routineName: session.routineName,
    completedAt: session.completedAt,
    exercisesCount: session.exercisesCount,
    setsCount: session.setsCount,
  };
}

function toRoutineExecutionSummary(
  summary: RoutineExecutionSummaryRecord,
): RoutineExecutionSummary {
  return {
    routineId: summary.routineId,
    routineName: summary.routineName,
    routineOrder: summary.routineOrder,
    completedSessionsCount: summary.completedSessionsCount,
    lastCompletedAt: summary.lastCompletedAt,
  };
}

function toExerciseSetHistoryEntry(
  record: ExerciseSetHistoryRecord,
): ExerciseSetHistoryEntry {
  return {
    id: record.id,
    sessionId: record.sessionId,
    routineName: record.routineName,
    completedAt: record.completedAt,
    setNumber: record.setNumber,
    loadKg: record.loadKg,
    reps: record.reps,
    rir: record.rir,
    notes: record.notes,
  };
}
