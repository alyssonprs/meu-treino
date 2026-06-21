import type { MovementPattern } from "@/domain/movementPattern";
import type { PlannedExerciseRecord } from "@/storage/workoutPlanRepository";
import {
  defaultCuesByMovementPattern,
  visualGuideIdsByExerciseId,
  visualGuidesById,
} from "./exerciseGuideCatalog";

export type ExerciseGuide = {
  imageUrl: string | null;
  imageAlt: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  executionCues: string[];
};

export function getExerciseGuide(
  exercise: PlannedExerciseRecord,
): ExerciseGuide {
  const visualGuide = resolveVisualGuide(exercise);
  const primaryMuscles = normalizeList(exercise.primary_muscles);
  const secondaryMuscles = normalizeList(exercise.secondary_muscles);
  const executionCues = normalizeList(exercise.execution_cues);
  const fallbackCues = getFallbackCues(exercise.movement_pattern);

  return {
    imageUrl: visualGuide?.imageUrl ?? null,
    imageAlt:
      visualGuide?.imageAlt ??
      `Guia do exercicio ${exercise.name} com foco em ${exercise.muscleGroup}.`,
    primaryMuscles:
      primaryMuscles.length > 0 ? primaryMuscles : [exercise.muscleGroup],
    secondaryMuscles,
    executionCues:
      executionCues.length > 0
        ? executionCues.slice(0, 3)
        : (fallbackCues ?? normalizeList([exercise.notes])).slice(0, 3),
  };
}

function resolveVisualGuide(exercise: PlannedExerciseRecord) {
  const visualId = normalizeVisualId(exercise.visual_id);

  if (visualId && visualGuidesById[visualId]) {
    return visualGuidesById[visualId];
  }

  if (exercise.sourceExerciseId) {
    const visualGuideId = visualGuideIdsByExerciseId[exercise.sourceExerciseId];

    if (visualGuideId) {
      return visualGuidesById[visualGuideId];
    }
  }

  return null;
}

function getFallbackCues(movementPattern: MovementPattern | undefined) {
  return movementPattern
    ? defaultCuesByMovementPattern[movementPattern]
    : undefined;
}

function normalizeList(items: (string | undefined)[] | undefined) {
  return (items ?? [])
    .map((item) => item?.trim() ?? "")
    .filter((item) => item.length > 0);
}

function normalizeVisualId(visualId: string | undefined) {
  const normalized = visualId?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}
