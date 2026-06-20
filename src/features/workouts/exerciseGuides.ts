import type { MovementPattern } from "@/domain/movementPattern";
import type { PlannedExerciseRecord } from "@/storage/workoutPlanRepository";
import {
  genericVisualGuidesByMovementPattern,
  visualGuideIdsByExerciseId,
  visualGuidesById,
  type VisualGuide,
} from "./exerciseGuideCatalog";

export type ExerciseGuide = {
  imageUrl: string | null;
  imageAlt: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  executionCues: string[];
};

const defaultCuesByMovementPattern: Record<MovementPattern, string[]> = {
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
  lunge: [
    "Passo firme",
    "Joelho acompanha o pe",
    "Suba empurrando o chao",
  ],
  hip_thrust: [
    "Queixo levemente recolhido",
    "Suba ate alinhar o quadril",
    "Controle a descida",
  ],
  leg_extension: [
    "Apoie bem o quadril",
    "Estenda sem travar o joelho",
    "Volte com controle",
  ],
  leg_curl: [
    "Quadril firme no apoio",
    "Flexione com controle",
    "Evite tirar o corpo do banco",
  ],
  calf_raise: [
    "Suba ate contrair a panturrilha",
    "Desca com amplitude",
    "Mantenha o controle",
  ],
  shoulder_abduction: [
    "Cotovelos levemente flexionados",
    "Suba ate a linha dos ombros",
    "Controle a descida",
  ],
  core_flexion: [
    "Contraia o abdomen",
    "Suba sem puxar o pescoco",
    "Volte com controle",
  ],
  core_anti_extension: [
    "Mantenha o tronco firme",
    "Evite deixar o quadril cair",
    "Respire de forma controlada",
  ],
  core_rotation: [
    "Gire com controle",
    "Mantenha o abdomen ativo",
    "Evite impulso excessivo",
  ],
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

  const movementPatternGuide = getGenericVisualGuide(exercise.movement_pattern);

  if (movementPatternGuide) {
    return movementPatternGuide;
  }

  return null;
}

function getGenericVisualGuide(
  movementPattern: MovementPattern | undefined,
): VisualGuide | null {
  return movementPattern
    ? genericVisualGuidesByMovementPattern[movementPattern]
    : null;
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
