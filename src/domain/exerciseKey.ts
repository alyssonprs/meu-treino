import type { PlannedExercise } from "./workoutPlan";

function normalizeKeyPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function createExerciseCanonicalKey(
  exercise: Pick<
    PlannedExercise,
    "name" | "muscle_group" | "equipment" | "is_unilateral"
  >,
): string {
  return [
    normalizeKeyPart(exercise.name),
    normalizeKeyPart(exercise.muscle_group),
    normalizeKeyPart(exercise.equipment),
    exercise.is_unilateral ? "unilateral" : "bilateral",
  ].join("|");
}
