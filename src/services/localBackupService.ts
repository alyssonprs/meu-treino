import { z } from "zod";

import type {
  AppSettingsRecord,
  ExerciseLoadHistoryRecord,
  ExerciseLogRecord,
  ExerciseRecord,
  PlannedExerciseRecord,
  RoutineRecord,
  RoutineStepRecord,
  SetLogRecord,
  WorkoutPlanProgressRecord,
  WorkoutPlanRecord,
  WorkoutSessionRecord,
} from "@/storage/workoutPlanRepository";

const backupSchemaVersion = 1;

const optionalTextArraySchema = z.array(z.string()).optional();

const workoutPlanRecordSchema = z
  .object({
    id: z.string(),
    sourcePlanId: z.string().nullable(),
    name: z.string(),
    objective: z.string(),
    level: z.string(),
    estimatedDurationWeeks: z.number().int().positive(),
    daysPerWeek: z.number().int().positive(),
    isActive: z.boolean(),
    importedAt: z.string(),
  })
  .strict();

const routineRecordSchema = z
  .object({
    id: z.string(),
    planId: z.string(),
    sourceRoutineId: z.string(),
    name: z.string(),
    order: z.number().int().positive(),
  })
  .strict();

const routineStepRecordSchema = z
  .object({
    id: z.string(),
    routineId: z.string(),
    planId: z.string(),
    kind: z.enum(["warmup", "cooldown"]),
    order: z.number().int().positive(),
    type: z.enum(["warmup", "cooldown"]).optional(),
    activity: z.string(),
    duration_minutes: z.number().int().positive(),
    notes: z.string().optional(),
  })
  .strict();

const exerciseRecordSchema = z
  .object({
    id: z.string(),
    sourceExerciseId: z.string().nullable(),
    canonicalKey: z.string(),
    name: z.string(),
    muscleGroup: z.string(),
    equipment: z.string(),
    isUnilateral: z.boolean(),
  })
  .strict();

const plannedExerciseRecordSchema = z
  .object({
    id: z.string(),
    routineId: z.string(),
    planId: z.string(),
    exerciseId: z.string(),
    sourceExerciseId: z.string().nullable(),
    name: z.string(),
    muscleGroup: z.string(),
    equipment: z.string(),
    isUnilateral: z.boolean(),
    sets: z.number().int().positive(),
    target_reps: z.string(),
    target_rir: z.number().int().nonnegative().optional(),
    rest_seconds: z.number().int().positive().optional(),
    tempo: z.string().optional(),
    advanced_technique: z.string().optional(),
    primary_muscles: optionalTextArraySchema,
    secondary_muscles: optionalTextArraySchema,
    movement_pattern: z.string().optional(),
    visual_id: z.string().optional(),
    execution_cues: optionalTextArraySchema,
    notes: z.string().optional(),
    media_url: z.string().optional(),
    order: z.number().int().positive(),
  })
  .strict();

const workoutPlanProgressRecordSchema = z
  .object({
    planId: z.string(),
    completedSessionsCount: z.number().int().nonnegative(),
    lastCompletedRoutineId: z.string().nullable(),
    lastCompletedRoutineOrder: z.number().int().positive().nullable(),
    lastCompletedAt: z.string().nullable(),
  })
  .strict();

const workoutSessionRecordSchema = z
  .object({
    id: z.string(),
    planId: z.string(),
    routineId: z.string(),
    routineName: z.string(),
    routineOrder: z.number().int().positive(),
    startedAt: z.string(),
    completedAt: z.string(),
    status: z.literal("completed"),
  })
  .strict();

const exerciseLogRecordSchema = z
  .object({
    id: z.string(),
    sessionId: z.string(),
    planId: z.string(),
    routineId: z.string(),
    plannedExerciseId: z.string(),
    exerciseId: z.string(),
    exerciseName: z.string(),
    order: z.number().int().positive(),
  })
  .strict();

const setLogRecordSchema = z
  .object({
    id: z.string(),
    sessionId: z.string(),
    exerciseLogId: z.string(),
    exerciseId: z.string(),
    setNumber: z.number().int().positive(),
    loadKg: z.number().nonnegative(),
    reps: z.number().int().nonnegative(),
    rir: z.number().int().nonnegative().nullable(),
    notes: z.string().nullable(),
    completedAt: z.string(),
  })
  .strict();

const exerciseLoadHistoryRecordSchema = z
  .object({
    exerciseId: z.string(),
    sourceExerciseId: z.string().nullable(),
    exerciseName: z.string(),
    lastLoadKg: z.number().nonnegative(),
    maxLoadKg: z.number().nonnegative(),
    lastReps: z.number().int().nonnegative(),
    lastRir: z.number().int().nonnegative().nullable(),
    completedSetsCount: z.number().int().nonnegative(),
    updatedAt: z.string(),
  })
  .strict();

const appSettingsRecordSchema = z
  .object({
    id: z.literal("app"),
    schemaVersion: z.number().int().positive(),
    healthConnectAutoExportEnabled: z.boolean(),
    updatedAt: z.string(),
  })
  .strict();

const localDataBackupTablesSchema = z
  .object({
    workoutPlans: z.array(workoutPlanRecordSchema),
    routines: z.array(routineRecordSchema),
    routineSteps: z.array(routineStepRecordSchema),
    exercises: z.array(exerciseRecordSchema),
    plannedExercises: z.array(plannedExerciseRecordSchema),
    workoutPlanProgress: z.array(workoutPlanProgressRecordSchema),
    workoutSessions: z.array(workoutSessionRecordSchema),
    exerciseLogs: z.array(exerciseLogRecordSchema),
    setLogs: z.array(setLogRecordSchema),
    exerciseLoadHistory: z.array(exerciseLoadHistoryRecordSchema),
    appSettings: z.array(appSettingsRecordSchema),
  })
  .strict();

export const localDataBackupSchema = z
  .object({
    app: z.literal("meu-treino"),
    kind: z.literal("local-data-backup"),
    schemaVersion: z.literal(backupSchemaVersion),
    exportedAt: z.string(),
    tables: localDataBackupTablesSchema,
  })
  .strict()
  .superRefine((backup, context) => {
    const activePlans = backup.tables.workoutPlans.filter(
      (plan) => plan.isActive,
    );

    if (activePlans.length > 1) {
      context.addIssue({
        code: "custom",
        path: ["tables", "workoutPlans"],
        message: "O backup nao pode ter mais de um plano ativo.",
      });
    }
  });

export type LocalDataBackup = z.infer<typeof localDataBackupSchema>;

export type LocalDataBackupTables = {
  workoutPlans: WorkoutPlanRecord[];
  routines: RoutineRecord[];
  routineSteps: RoutineStepRecord[];
  exercises: ExerciseRecord[];
  plannedExercises: PlannedExerciseRecord[];
  workoutPlanProgress: WorkoutPlanProgressRecord[];
  workoutSessions: WorkoutSessionRecord[];
  exerciseLogs: ExerciseLogRecord[];
  setLogs: SetLogRecord[];
  exerciseLoadHistory: ExerciseLoadHistoryRecord[];
  appSettings: AppSettingsRecord[];
};

export type LocalBackupValidationError = {
  path: string;
  message: string;
};

export type LocalBackupParseResult =
  | {
      success: true;
      backup: LocalDataBackup;
      errors: [];
    }
  | {
      success: false;
      backup: null;
      errors: LocalBackupValidationError[];
    };

export function createLocalDataBackup({
  exportedAt,
  tables,
}: {
  exportedAt: string;
  tables: LocalDataBackupTables;
}): LocalDataBackup {
  return {
    app: "meu-treino",
    kind: "local-data-backup",
    schemaVersion: backupSchemaVersion,
    exportedAt,
    tables,
  };
}

export function parseLocalDataBackupJson(
  jsonText: string,
): LocalBackupParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      success: false,
      backup: null,
      errors: [
        {
          path: "arquivo",
          message: "O arquivo selecionado nao contem um JSON valido.",
        },
      ],
    };
  }

  const result = localDataBackupSchema.safeParse(parsed);

  if (result.success) {
    return {
      success: true,
      backup: result.data,
      errors: [],
    };
  }

  return {
    success: false,
    backup: null,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "backup",
      message: issue.message,
    })),
  };
}

export function serializeLocalDataBackup(backup: LocalDataBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}
