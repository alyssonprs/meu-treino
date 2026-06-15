import { z } from "zod";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} e obrigatorio`);

const positiveInteger = (fieldName: string) =>
  z
    .number()
    .int(`${fieldName} deve ser um numero inteiro`)
    .positive(`${fieldName} deve ser maior que zero`);

const nonNegativeInteger = (fieldName: string) =>
  z
    .number()
    .int(`${fieldName} deve ser um numero inteiro`)
    .nonnegative(`${fieldName} nao pode ser negativo`);

export const workoutPlanStepSchema = z.object({
  type: z.enum(["warmup", "cooldown"]).optional(),
  activity: requiredText("Atividade"),
  duration_minutes: positiveInteger("Duracao"),
  notes: z.string().trim().optional(),
});

export const plannedExerciseSchema = z
  .object({
    exercise_id: z.string().trim().optional(),
    name: requiredText("Nome do exercicio"),
    muscle_group: requiredText("Grupo muscular"),
    equipment: requiredText("Equipamento"),
    is_unilateral: z.boolean(),
    sets: positiveInteger("Series"),
    target_reps: requiredText("Repeticoes alvo"),
    target_rir: nonNegativeInteger("RIR alvo").optional(),
    rest_seconds: positiveInteger("Descanso").optional(),
    tempo: z.string().trim().optional(),
    advanced_technique: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    media_url: z.string().trim().url("URL de midia invalida").optional(),
  })
  .refine((exercise) => exercise.exercise_id !== "", {
    message: "exercise_id nao pode ser vazio quando informado",
    path: ["exercise_id"],
  });

export const workoutRoutineSchema = z.object({
  routine_id: requiredText("ID da rotina"),
  name: requiredText("Nome da rotina"),
  order: positiveInteger("Ordem da rotina"),
  warmup: z.array(workoutPlanStepSchema).default([]),
  exercises: z
    .array(plannedExerciseSchema)
    .min(1, "A rotina deve ter ao menos um exercicio"),
  cooldown: z.array(workoutPlanStepSchema).default([]),
});

export const workoutPlanSchema = z.object({
  workout_plan: z.object({
    plan_id: requiredText("ID do plano").optional(),
    name: requiredText("Nome do plano"),
    objective: requiredText("Objetivo"),
    level: requiredText("Nivel"),
    estimated_duration_weeks: positiveInteger("Semanas estimadas"),
    days_per_week: positiveInteger("Dias por semana"),
    routines: z
      .array(workoutRoutineSchema)
      .min(1, "O plano deve ter ao menos uma rotina"),
  }),
});

export type WorkoutPlanImport = z.infer<typeof workoutPlanSchema>;
export type WorkoutPlan = WorkoutPlanImport["workout_plan"];
export type WorkoutRoutine = z.infer<typeof workoutRoutineSchema>;
export type PlannedExercise = z.infer<typeof plannedExerciseSchema>;
export type WorkoutPlanStep = z.infer<typeof workoutPlanStepSchema>;

export type WorkoutPlanValidationError = {
  path: string;
  message: string;
};

export type WorkoutPlanValidationResult =
  | {
      success: true;
      data: WorkoutPlanImport;
      errors: [];
    }
  | {
      success: false;
      data: null;
      errors: WorkoutPlanValidationError[];
    };

export function validateWorkoutPlanJson(
  input: unknown,
): WorkoutPlanValidationResult {
  const result = workoutPlanSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  return {
    success: false,
    data: null,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "workout_plan",
      message: issue.message,
    })),
  };
}
