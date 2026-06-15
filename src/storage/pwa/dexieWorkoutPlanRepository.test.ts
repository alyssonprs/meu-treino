import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import type { WorkoutPlan } from "@/domain/workoutPlan";

import { DexieWorkoutPlanRepository } from "./dexieWorkoutPlanRepository";
import { MeuTreinoDatabase } from "./workoutDatabase";

const basePlan: WorkoutPlan = {
  plan_id: "hipertrofia-01",
  name: "Hipertrofia 4 dias",
  objective: "Ganho de massa muscular",
  level: "intermediario",
  estimated_duration_weeks: 8,
  days_per_week: 4,
  routines: [
    {
      routine_id: "treino-b",
      name: "Treino B",
      order: 2,
      warmup: [],
      exercises: [
        {
          name: "Remada curvada",
          muscle_group: "Costas",
          equipment: "Barra",
          is_unilateral: false,
          sets: 4,
          target_reps: "8-10",
        },
      ],
      cooldown: [],
    },
    {
      routine_id: "treino-a",
      name: "Treino A",
      order: 1,
      warmup: [
        {
          type: "warmup",
          activity: "Esteira leve",
          duration_minutes: 8,
        },
      ],
      exercises: [
        {
          exercise_id: "supino-reto-barra",
          name: "Supino reto",
          muscle_group: "Peitoral",
          equipment: "Barra",
          is_unilateral: false,
          sets: 4,
          target_reps: "8-10",
          target_rir: 2,
          rest_seconds: 90,
        },
      ],
      cooldown: [
        {
          type: "cooldown",
          activity: "Alongamento peitoral",
          duration_minutes: 3,
        },
      ],
    },
  ],
};

const replacementPlan: WorkoutPlan = {
  plan_id: "forca-01",
  name: "Forca 3 dias",
  objective: "Forca",
  level: "intermediario",
  estimated_duration_weeks: 6,
  days_per_week: 3,
  routines: [
    {
      routine_id: "full-body",
      name: "Full body",
      order: 1,
      warmup: [],
      exercises: [
        {
          exercise_id: "agachamento-livre",
          name: "Agachamento livre",
          muscle_group: "Pernas",
          equipment: "Barra",
          is_unilateral: false,
          sets: 5,
          target_reps: "5",
        },
      ],
      cooldown: [],
    },
  ],
};

describe("DexieWorkoutPlanRepository", () => {
  const databases: MeuTreinoDatabase[] = [];

  afterEach(async () => {
    await Promise.all(databases.map((database) => database.delete()));
    databases.length = 0;
  });

  function createRepository() {
    const database = new MeuTreinoDatabase(`meu-treino-test-${crypto.randomUUID()}`);
    databases.push(database);

    let nextId = 0;

    return new DexieWorkoutPlanRepository({
      database,
      createId: () => `id-${++nextId}`,
      now: () => "2026-06-15T12:00:00.000Z",
    });
  }

  it("saves and reads the active workout plan with ordered routines", async () => {
    const repository = createRepository();

    const result = await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();

    expect(result.planId).toBe("id-1");
    expect(activePlan?.plan).toMatchObject({
      id: "id-1",
      sourcePlanId: "hipertrofia-01",
      name: "Hipertrofia 4 dias",
      isActive: true,
    });
    expect(activePlan?.progress).toEqual({
      planId: "id-1",
      completedSessionsCount: 0,
      lastCompletedRoutineId: null,
      lastCompletedRoutineOrder: null,
      lastCompletedAt: null,
    });
    expect(activePlan?.routines.map((routine) => routine.name)).toEqual([
      "Treino A",
      "Treino B",
    ]);
    expect(activePlan?.routines[0].warmup[0].activity).toBe("Esteira leve");
    expect(activePlan?.routines[0].exercises[0]).toMatchObject({
      sourceExerciseId: "supino-reto-barra",
      exerciseId: "supino-reto-barra",
      name: "Supino reto",
      sets: 4,
      target_rir: 2,
    });
  });

  it("replaces the active workout plan and resets active plan progress", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const replacement = await repository.saveActivePlan({ plan: replacementPlan });
    const activePlan = await repository.getActivePlan();

    expect(replacement.planId).not.toBe("id-1");
    expect(activePlan?.plan).toMatchObject({
      id: replacement.planId,
      sourcePlanId: "forca-01",
      name: "Forca 3 dias",
      isActive: true,
    });
    expect(activePlan?.routines).toHaveLength(1);
    expect(activePlan?.routines[0].exercises[0].name).toBe("Agachamento livre");
    expect(activePlan?.progress).toMatchObject({
      planId: replacement.planId,
      completedSessionsCount: 0,
      lastCompletedRoutineId: null,
    });
  });

  it("creates canonical exercise keys when the imported exercise has no stable id", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();

    expect(activePlan?.routines[1].exercises[0]).toMatchObject({
      sourceExerciseId: null,
      exerciseId: "remada curvada|costas|barra|bilateral",
    });
  });

  it("marks a routine as completed and updates active plan progress", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();
    const completedRoutine = activePlan?.routines[0];

    if (!activePlan || !completedRoutine) {
      throw new Error("Fixture should create an active plan with routines");
    }

    await repository.markRoutineAsCompleted({
      planId: activePlan.plan.id,
      routineId: completedRoutine.id,
      routineOrder: completedRoutine.order,
      completedAt: "2026-06-15T13:00:00.000Z",
    });

    const updatedPlan = await repository.getActivePlan();

    expect(updatedPlan?.progress).toEqual({
      planId: activePlan.plan.id,
      completedSessionsCount: 1,
      lastCompletedRoutineId: completedRoutine.id,
      lastCompletedRoutineOrder: 1,
      lastCompletedAt: "2026-06-15T13:00:00.000Z",
    });
  });
});
