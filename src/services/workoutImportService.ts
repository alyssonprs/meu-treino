import type {
  WorkoutPlan,
  WorkoutPlanValidationError,
} from "@/domain/workoutPlan";
import { validateWorkoutPlanJson } from "@/domain/workoutPlan";
import exerciseMediaLibrary from "@/config/exercise-media-library.json";
import type {
  SaveActiveWorkoutPlanResult,
  WorkoutPlanRepository,
} from "@/storage/workoutPlanRepository";

type ExerciseMediaLibraryConfig = {
  exercises: {
    visual_id: string;
  }[];
};

export type WorkoutPlanImportWarning = {
  code: "unknown_visual_id";
  message: string;
  visualIds: string[];
  exerciseNames: string[];
};

export type WorkoutPlanPreview = {
  plan: WorkoutPlan;
  name: string;
  objective: string;
  level: string;
  estimatedDurationWeeks: number;
  daysPerWeek: number;
  routineCount: number;
  exerciseCount: number;
  warnings: WorkoutPlanImportWarning[];
};

const knownVisualIds = new Set(
  (exerciseMediaLibrary as ExerciseMediaLibraryConfig).exercises.map(
    (exercise) => exercise.visual_id,
  ),
);

export type WorkoutImportParseResult =
  | {
      success: true;
      preview: WorkoutPlanPreview;
      errors: [];
    }
  | {
      success: false;
      preview: null;
      errors: WorkoutPlanValidationError[];
    };

export function parseWorkoutPlanImport(jsonText: string): WorkoutImportParseResult {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    return {
      success: false,
      preview: null,
      errors: [
        {
          path: "arquivo",
          message: "O arquivo precisa ser um JSON valido",
        },
      ],
    };
  }

  const validation = validateWorkoutPlanJson(parsedJson);

  if (!validation.success) {
    return {
      success: false,
      preview: null,
      errors: validation.errors,
    };
  }

  return {
    success: true,
    preview: createWorkoutPlanPreview(validation.data.workout_plan),
    errors: [],
  };
}

export async function activateImportedWorkoutPlan({
  preview,
  repository,
}: {
  preview: WorkoutPlanPreview;
  repository: WorkoutPlanRepository;
}): Promise<SaveActiveWorkoutPlanResult> {
  return repository.saveActivePlan({
    plan: preview.plan,
  });
}

function createWorkoutPlanPreview(plan: WorkoutPlan): WorkoutPlanPreview {
  return {
    plan,
    name: plan.name,
    objective: plan.objective,
    level: plan.level,
    estimatedDurationWeeks: plan.estimated_duration_weeks,
    daysPerWeek: plan.days_per_week,
    routineCount: plan.routines.length,
    exerciseCount: plan.routines.reduce(
      (total, routine) => total + routine.exercises.length,
      0,
    ),
    warnings: createImportWarnings(plan),
  };
}

function createImportWarnings(plan: WorkoutPlan): WorkoutPlanImportWarning[] {
  const unknownVisualIds = new Map<string, Set<string>>();

  for (const routine of plan.routines) {
    for (const exercise of routine.exercises) {
      const visualId = exercise.visual_id?.trim();

      if (!visualId || knownVisualIds.has(visualId)) {
        continue;
      }

      const exerciseNames = unknownVisualIds.get(visualId) ?? new Set<string>();
      exerciseNames.add(exercise.name);
      unknownVisualIds.set(visualId, exerciseNames);
    }
  }

  if (unknownVisualIds.size === 0) {
    return [];
  }

  const visualIds = Array.from(unknownVisualIds.keys()).sort();
  const exerciseNames = Array.from(unknownVisualIds.values())
    .flatMap((names) => Array.from(names))
    .sort();

  return [
    {
      code: "unknown_visual_id",
      message:
        visualIds.length === 1
          ? "1 visual_id nao tem midia local no app. A importacao pode continuar, mas esse exercicio usara o guia sem imagem."
          : `${visualIds.length} visual_id nao tem midia local no app. A importacao pode continuar, mas esses exercicios usarao o guia sem imagem.`,
      visualIds,
      exerciseNames,
    },
  ];
}
