import type {
  ExerciseLoadHistoryRecord,
  PlannedExerciseRecord,
  RoutineWithDetails,
  SaveCompletedWorkoutSessionInput,
  WorkoutPlanRepository,
} from "@/storage/workoutPlanRepository";

export type WorkoutSetDraft = {
  loadKg: string;
  reps: string;
  rir: string;
  notes: string;
  completedAt: string | null;
};

export type WorkoutSetCompletionDraft = {
  completedAt: string | null;
};

export type WorkoutExerciseDraft = {
  plannedExerciseId: string;
  completedSets: WorkoutSetCompletionDraft[];
  result: WorkoutSetDraft;
};

export type WorkoutSessionDraft = {
  planId: string;
  routine: RoutineWithDetails;
  startedAt: string;
  initialExerciseIndex: number;
  currentExerciseIndex: number;
  exercises: WorkoutExerciseDraft[];
};

export type FinishWorkoutSessionResult =
  | {
      success: true;
      sessionId: string;
      completedAt: string;
      routineName: string;
      completedExercisesCount: number;
      completedRecordsCount: number;
    }
  | {
      success: false;
      message: string;
    };

export function createWorkoutSessionDraft({
  planId,
  routine,
  startedAt,
  loadHistoryByExerciseId,
  initialExerciseIndex = 0,
}: {
  planId: string;
  routine: RoutineWithDetails;
  startedAt: string;
  loadHistoryByExerciseId?: Map<string, ExerciseLoadHistoryRecord>;
  initialExerciseIndex?: number;
}): WorkoutSessionDraft {
  return {
    planId,
    routine,
    startedAt,
    initialExerciseIndex:
      initialExerciseIndex >= 0 && initialExerciseIndex < routine.exercises.length
        ? initialExerciseIndex
        : 0,
    currentExerciseIndex:
      initialExerciseIndex >= 0 && initialExerciseIndex < routine.exercises.length
        ? initialExerciseIndex
        : 0,
    exercises: routine.exercises.map((exercise) => {
      const loadHistory = loadHistoryByExerciseId?.get(exercise.exerciseId);

      return {
        plannedExerciseId: exercise.id,
        completedSets: Array.from({ length: exercise.sets }, () => ({
          completedAt: null,
        })),
        result: {
          loadKg:
            typeof loadHistory?.lastLoadKg === "number"
              ? String(loadHistory.lastLoadKg)
              : "",
          reps: "",
          rir: "",
          notes: "",
          completedAt: null,
        },
      };
    }),
  };
}

export function setCurrentExerciseInDraft({
  draft,
  exerciseIndex,
}: {
  draft: WorkoutSessionDraft;
  exerciseIndex: number;
}): WorkoutSessionDraft {
  if (exerciseIndex < 0 || exerciseIndex >= draft.exercises.length) {
    return draft;
  }

  return {
    ...draft,
    currentExerciseIndex: exerciseIndex,
  };
}

export function getNextPendingSetIndex(
  draft: WorkoutSessionDraft,
  exerciseIndex: number,
): number | null {
  const exerciseDraft = draft.exercises[exerciseIndex];

  if (!exerciseDraft) {
    return null;
  }

  const pendingIndex = exerciseDraft.completedSets.findIndex(
    (set) => set.completedAt === null,
  );

  return pendingIndex >= 0 ? pendingIndex : null;
}

export function markWorkoutSetCompletedInDraft({
  draft,
  exerciseIndex,
  setIndex,
  completedAt,
}: {
  draft: WorkoutSessionDraft;
  exerciseIndex: number;
  setIndex: number;
  completedAt: string;
}): WorkoutSessionDraft {
  return {
    ...draft,
    currentExerciseIndex: exerciseIndex,
    exercises: draft.exercises.map((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return exercise;
      }

      return {
        ...exercise,
        completedSets: exercise.completedSets.map((set, currentSetIndex) =>
          currentSetIndex === setIndex
            ? {
                ...set,
                completedAt,
              }
            : set,
        ),
      };
    }),
  };
}

export function saveExerciseResultInDraft({
  draft,
  exerciseIndex,
  values,
  savedAt,
}: {
  draft: WorkoutSessionDraft;
  exerciseIndex: number;
  values: Pick<WorkoutSetDraft, "loadKg" | "reps" | "rir" | "notes">;
  savedAt: string;
}): WorkoutSessionDraft {
  return {
    ...draft,
    currentExerciseIndex: exerciseIndex,
    exercises: draft.exercises.map((exercise, currentExerciseIndex) => {
      if (currentExerciseIndex !== exerciseIndex) {
        return exercise;
      }

      return {
        ...exercise,
        result: {
          ...exercise.result,
          ...values,
          completedAt: savedAt,
        },
      };
    }),
  };
}

export async function finishWorkoutSession({
  draft,
  completedAt,
  repository,
}: {
  draft: WorkoutSessionDraft;
  completedAt: string;
  repository: Pick<WorkoutPlanRepository, "saveCompletedWorkoutSession">;
}): Promise<FinishWorkoutSessionResult> {
  const input = toCompletedWorkoutSessionInput(draft, completedAt);

  if (!input) {
    return {
      success: false,
      message: "Registre carga e repetições em pelo menos um exercício.",
    };
  }

  const result = await repository.saveCompletedWorkoutSession(input);

  return {
    success: true,
    sessionId: result.sessionId,
    completedAt,
    routineName: input.routineName,
    completedExercisesCount: input.exercises.length,
    completedRecordsCount: input.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    ),
  };
}

function toCompletedWorkoutSessionInput(
  draft: WorkoutSessionDraft,
  completedAt: string,
): SaveCompletedWorkoutSessionInput | null {
  const plannedById = new Map(
    draft.routine.exercises.map((exercise) => [exercise.id, exercise]),
  );

  const exercises = draft.exercises
    .map((exerciseDraft) => {
      const plannedExercise = plannedById.get(exerciseDraft.plannedExerciseId);

      if (!plannedExercise) {
        return null;
      }

      const sets =
        exerciseDraft.result.completedAt === null
          ? []
          : [toCompletedSet(exerciseDraft.result, 1)].filter(
              (set) => set !== null,
            );

      if (sets.length === 0) {
        return null;
      }

      return toCompletedExercise(plannedExercise, sets);
    })
    .filter((exercise) => exercise !== null);

  if (exercises.length === 0) {
    return null;
  }

  return {
    planId: draft.planId,
    routineId: draft.routine.id,
    routineName: draft.routine.name,
    routineOrder: draft.routine.order,
    startedAt: draft.startedAt,
    completedAt,
    exercises,
  };
}

function toCompletedSet(
  setDraft: WorkoutSetDraft,
  setNumber: number,
): SaveCompletedWorkoutSessionInput["exercises"][number]["sets"][number] | null {
  const loadKg = Number(setDraft.loadKg.replace(",", "."));
  const reps = Number(setDraft.reps);

  if (!Number.isFinite(loadKg) || loadKg < 0 || !Number.isInteger(reps) || reps <= 0) {
    return null;
  }

  const parsedRir = setDraft.rir.trim() === "" ? null : Number(setDraft.rir);
  const rir =
    parsedRir !== null && Number.isInteger(parsedRir) && parsedRir >= 0
      ? parsedRir
      : null;

  return {
    setNumber,
    loadKg,
    reps,
    rir,
    notes: setDraft.notes.trim() || null,
  };
}

function toCompletedExercise(
  exercise: PlannedExerciseRecord,
  sets: SaveCompletedWorkoutSessionInput["exercises"][number]["sets"],
): SaveCompletedWorkoutSessionInput["exercises"][number] {
  return {
    plannedExerciseId: exercise.id,
    exerciseId: exercise.exerciseId,
    sourceExerciseId: exercise.sourceExerciseId,
    exerciseName: exercise.name,
    order: exercise.order,
    sets,
  };
}
