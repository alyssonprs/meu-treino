import barbellBenchPressGuideUrl from "@/assets/exercise-guides/barbell-bench-press.jpg";
import type { PlannedExerciseRecord } from "@/storage/workoutPlanRepository";

export type ExerciseGuide = {
  imageUrl: string | null;
  imageAlt: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  executionCues: string[];
};

type VisualGuide = {
  imageUrl: string;
  imageAlt: string;
};

const visualGuidesById: Record<string, VisualGuide> = {
  barbell_bench_press: {
    imageUrl: barbellBenchPressGuideUrl,
    imageAlt:
      "Guia visual do supino reto com peitoral em destaque e seta do movimento da barra.",
  },
};

const defaultCuesByMovementPattern: Record<string, string[]> = {
  horizontal_push: [
    "Pes firmes no chao",
    "Desca com controle",
    "Empurre sem tirar o ombro do banco",
  ],
  horizontal_pull: [
    "Tronco firme",
    "Puxe com os cotovelos",
    "Controle a volta",
  ],
  vertical_push: [
    "Costelas baixas",
    "Suba em linha controlada",
    "Desca sem perder tensao",
  ],
  vertical_pull: [
    "Ombros longe das orelhas",
    "Puxe com os cotovelos",
    "Controle a subida",
  ],
  squat: [
    "Pes firmes no chao",
    "Joelhos acompanham os pes",
    "Suba empurrando o chao",
  ],
  hinge: [
    "Coluna neutra",
    "Quadril vai para tras",
    "Suba contraindo gluteos",
  ],
  elbow_flexion: [
    "Cotovelos estaveis",
    "Suba sem balancar o tronco",
    "Desca com controle",
  ],
  elbow_extension: [
    "Cotovelos perto do tronco",
    "Estenda ate contrair o triceps",
    "Volte com controle",
  ],
};

export function getExerciseGuide(
  exercise: PlannedExerciseRecord,
): ExerciseGuide {
  const visualGuide = resolveVisualGuide(exercise);
  const primaryMuscles = normalizeList(exercise.primary_muscles);
  const secondaryMuscles = normalizeList(exercise.secondary_muscles);
  const executionCues = normalizeList(exercise.execution_cues);
  const fallbackCues = exercise.movement_pattern
    ? defaultCuesByMovementPattern[exercise.movement_pattern]
    : undefined;

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

  if (exercise.sourceExerciseId === "supino-reto-barra") {
    return visualGuidesById.barbell_bench_press;
  }

  return null;
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
