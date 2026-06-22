import type {
  WorkoutPlan,
  WorkoutPlanValidationError,
} from "@/domain/workoutPlan";
import { validateWorkoutPlanJson } from "@/domain/workoutPlan";
import type {
  SaveActiveWorkoutPlanResult,
  WorkoutPlanRepository,
} from "@/storage/workoutPlanRepository";

export type WorkoutPlanImportWarning = {
  code: string;
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
    warnings: [],
  };
}
