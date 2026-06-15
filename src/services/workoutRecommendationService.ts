import type {
  ActiveWorkoutPlanSnapshot,
  MarkRoutineAsCompletedInput,
  RoutineWithDetails,
  WorkoutPlanRepository,
} from "@/storage/workoutPlanRepository";

export type NextRoutineRecommendation = {
  routineId: string;
  routineName: string;
  routineOrder: number;
  reason:
    | "first-workout"
    | "after-last-completed"
    | "cycle-restarted"
    | "missing-last-routine";
};

export async function getNextRecommendedRoutine({
  repository,
}: {
  repository: Pick<WorkoutPlanRepository, "getActivePlan">;
}): Promise<NextRoutineRecommendation | null> {
  const activePlan = await repository.getActivePlan();

  if (!activePlan) {
    return null;
  }

  return getNextRecommendedRoutineFromSnapshot(activePlan);
}

export function getNextRecommendedRoutineFromSnapshot(
  activePlan: ActiveWorkoutPlanSnapshot,
): NextRoutineRecommendation | null {
  const routines = sortRoutinesByOrder(activePlan.routines);
  const firstRoutine = routines[0];

  if (!firstRoutine) {
    return null;
  }

  const lastCompletedRoutineId = activePlan.progress.lastCompletedRoutineId;

  if (!lastCompletedRoutineId) {
    return toRecommendation(firstRoutine, "first-workout");
  }

  const lastRoutineIndex = routines.findIndex(
    (routine) => routine.id === lastCompletedRoutineId,
  );

  if (lastRoutineIndex === -1) {
    return toRecommendation(firstRoutine, "missing-last-routine");
  }

  const nextRoutine = routines[lastRoutineIndex + 1];

  if (!nextRoutine) {
    return toRecommendation(firstRoutine, "cycle-restarted");
  }

  return toRecommendation(nextRoutine, "after-last-completed");
}

export async function markRoutineAsCompleted({
  repository,
  ...input
}: MarkRoutineAsCompletedInput & {
  repository: Pick<WorkoutPlanRepository, "markRoutineAsCompleted">;
}): Promise<void> {
  await repository.markRoutineAsCompleted(input);
}

function sortRoutinesByOrder(
  routines: RoutineWithDetails[],
): RoutineWithDetails[] {
  return [...routines].sort((left, right) => left.order - right.order);
}

function toRecommendation(
  routine: RoutineWithDetails,
  reason: NextRoutineRecommendation["reason"],
): NextRoutineRecommendation {
  return {
    routineId: routine.id,
    routineName: routine.name,
    routineOrder: routine.order,
    reason,
  };
}
