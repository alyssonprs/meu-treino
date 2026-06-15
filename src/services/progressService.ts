import type {
  ActiveWorkoutPlanSnapshot,
  ExerciseLoadHistoryRecord,
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
