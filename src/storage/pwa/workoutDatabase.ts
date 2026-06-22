import Dexie, { type EntityTable } from "dexie";

import type {
  AppSettingsRecord,
  ExerciseRecord,
  ExerciseLoadHistoryRecord,
  ExerciseLogRecord,
  PlannedExerciseRecord,
  RoutineRecord,
  RoutineStepRecord,
  SetLogRecord,
  WorkoutSessionRecord,
  WorkoutPlanProgressRecord,
  WorkoutPlanRecord,
} from "../workoutPlanRepository";

export class MeuTreinoDatabase extends Dexie {
  workoutPlans!: EntityTable<WorkoutPlanRecord, "id">;
  routines!: EntityTable<RoutineRecord, "id">;
  routineSteps!: EntityTable<RoutineStepRecord, "id">;
  exercises!: EntityTable<ExerciseRecord, "id">;
  plannedExercises!: EntityTable<PlannedExerciseRecord, "id">;
  workoutPlanProgress!: EntityTable<WorkoutPlanProgressRecord, "planId">;
  workoutSessions!: EntityTable<WorkoutSessionRecord, "id">;
  exerciseLogs!: EntityTable<ExerciseLogRecord, "id">;
  setLogs!: EntityTable<SetLogRecord, "id">;
  exerciseLoadHistory!: EntityTable<ExerciseLoadHistoryRecord, "exerciseId">;
  appSettings!: EntityTable<AppSettingsRecord, "id">;

  constructor(databaseName = "meu-treino") {
    super(databaseName);

    this.version(1).stores({
      workoutPlans: "id, importedAt, sourcePlanId",
      routines: "id, planId, order, sourceRoutineId",
      routineSteps: "id, planId, routineId, kind, order",
      exercises: "id, sourceExerciseId, canonicalKey",
      plannedExercises: "id, planId, routineId, exerciseId, order",
      workoutPlanProgress: "planId",
    });

    this.version(2).stores({
      workoutPlans: "id, importedAt, sourcePlanId",
      routines: "id, planId, order, sourceRoutineId",
      routineSteps: "id, planId, routineId, kind, order",
      exercises: "id, sourceExerciseId, canonicalKey",
      plannedExercises: "id, planId, routineId, exerciseId, order",
      workoutPlanProgress: "planId",
      workoutSessions: "id, planId, routineId, completedAt",
      exerciseLogs: "id, sessionId, planId, routineId, exerciseId, order",
      setLogs: "id, sessionId, exerciseLogId, exerciseId, completedAt",
      exerciseLoadHistory: "exerciseId, sourceExerciseId, updatedAt",
    });

    this.version(3).stores({
      workoutPlans: "id, importedAt, sourcePlanId",
      routines: "id, planId, order, sourceRoutineId",
      routineSteps: "id, planId, routineId, kind, order",
      exercises: "id, sourceExerciseId, canonicalKey",
      plannedExercises: "id, planId, routineId, exerciseId, order",
      workoutPlanProgress: "planId",
      workoutSessions: "id, planId, routineId, completedAt",
      exerciseLogs: "id, sessionId, planId, routineId, exerciseId, order",
      setLogs: "id, sessionId, exerciseLogId, exerciseId, completedAt",
      exerciseLoadHistory: "exerciseId, sourceExerciseId, updatedAt",
      appSettings: "id",
    });
  }
}

export const workoutDatabase = new MeuTreinoDatabase();
