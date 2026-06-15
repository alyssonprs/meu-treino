import Dexie, { type EntityTable } from "dexie";

import type {
  ExerciseRecord,
  PlannedExerciseRecord,
  RoutineRecord,
  RoutineStepRecord,
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
  }
}

export const workoutDatabase = new MeuTreinoDatabase();
