import "fake-indexeddb/auto";

import Dexie from "dexie";
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
          primary_muscles: ["Peitoral maior"],
          secondary_muscles: ["Triceps", "Deltoide anterior"],
          movement_pattern: "horizontal_push",
          visual_id: "barbell_bench_press",
          execution_cues: [
            "Pes firmes no chao",
            "Desca com controle",
            "Empurre sem tirar os ombros do banco",
          ],
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

    return createRepositoryFromDatabase(database);
  }

  function createRepositoryFromDatabase(database: MeuTreinoDatabase) {
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
      primary_muscles: ["Peitoral maior"],
      secondary_muscles: ["Triceps", "Deltoide anterior"],
      movement_pattern: "horizontal_push",
      visual_id: "barbell_bench_press",
      execution_cues: [
        "Pes firmes no chao",
        "Desca com controle",
        "Empurre sem tirar os ombros do banco",
      ],
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

  it("saves a completed workout session with set logs and load history", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();
    const completedRoutine = activePlan?.routines[0];
    const completedExercise = completedRoutine?.exercises[0];

    if (!activePlan || !completedRoutine || !completedExercise) {
      throw new Error("Fixture should create an active routine with exercises");
    }

    const result = await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: completedRoutine.id,
      routineName: completedRoutine.name,
      routineOrder: completedRoutine.order,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: completedExercise.id,
          exerciseId: completedExercise.exerciseId,
          sourceExerciseId: completedExercise.sourceExerciseId,
          exerciseName: completedExercise.name,
          order: completedExercise.order,
          sets: [
            {
              setNumber: 1,
              loadKg: 60,
              reps: 8,
              rir: 2,
              notes: null,
            },
            {
              setNumber: 2,
              loadKg: 62.5,
              reps: 7,
              rir: 1,
              notes: "Pesado",
            },
          ],
        },
      ],
    });

    const updatedPlan = await repository.getActivePlan();
    const loadHistory = await repository.getExerciseLoadHistory([
      completedExercise.exerciseId,
    ]);

    expect(result.sessionId).toBe("id-8");
    expect(updatedPlan?.progress).toMatchObject({
      completedSessionsCount: 1,
      lastCompletedRoutineId: completedRoutine.id,
      lastCompletedRoutineOrder: completedRoutine.order,
    });
    expect(loadHistory).toEqual([
      {
        exerciseId: completedExercise.exerciseId,
        sourceExerciseId: completedExercise.sourceExerciseId,
        exerciseName: completedExercise.name,
        lastLoadKg: 62.5,
        maxLoadKg: 62.5,
        lastReps: 7,
        lastRir: 1,
        completedSetsCount: 2,
        updatedAt: "2026-06-15T13:00:00.000Z",
      },
    ]);
  });

  it("lists recent completed sessions with exercise and set counts", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();
    const firstRoutine = activePlan?.routines[0];
    const secondRoutine = activePlan?.routines[1];
    const firstExercise = firstRoutine?.exercises[0];
    const secondExercise = secondRoutine?.exercises[0];

    if (
      !activePlan ||
      !firstRoutine ||
      !secondRoutine ||
      !firstExercise ||
      !secondExercise
    ) {
      throw new Error("Fixture should create routines with exercises");
    }

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: firstRoutine.id,
      routineName: firstRoutine.name,
      routineOrder: firstRoutine.order,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: firstExercise.id,
          exerciseId: firstExercise.exerciseId,
          sourceExerciseId: firstExercise.sourceExerciseId,
          exerciseName: firstExercise.name,
          order: firstExercise.order,
          sets: [
            { setNumber: 1, loadKg: 60, reps: 8, rir: 2, notes: null },
            { setNumber: 2, loadKg: 62.5, reps: 7, rir: 1, notes: null },
          ],
        },
      ],
    });

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: secondRoutine.id,
      routineName: secondRoutine.name,
      routineOrder: secondRoutine.order,
      startedAt: "2026-06-16T12:00:00.000Z",
      completedAt: "2026-06-16T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: secondExercise.id,
          exerciseId: secondExercise.exerciseId,
          sourceExerciseId: secondExercise.sourceExerciseId,
          exerciseName: secondExercise.name,
          order: secondExercise.order,
          sets: [
            { setNumber: 1, loadKg: 50, reps: 10, rir: 2, notes: null },
          ],
        },
      ],
    });

    const recentSessions = await repository.getRecentCompletedWorkoutSessions();

    expect(recentSessions.map((session) => session.routineName)).toEqual([
      "Treino B",
      "Treino A",
    ]);
    expect(recentSessions[0]).toMatchObject({
      exercisesCount: 1,
      setsCount: 1,
      completedAt: "2026-06-16T13:00:00.000Z",
    });
    expect(recentSessions[1]).toMatchObject({
      exercisesCount: 1,
      setsCount: 2,
      completedAt: "2026-06-15T13:00:00.000Z",
    });
  });

  it("summarizes the last execution and completion count for each routine", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();
    const firstRoutine = activePlan?.routines[0];
    const secondRoutine = activePlan?.routines[1];
    const firstExercise = firstRoutine?.exercises[0];
    const secondExercise = secondRoutine?.exercises[0];

    if (
      !activePlan ||
      !firstRoutine ||
      !secondRoutine ||
      !firstExercise ||
      !secondExercise
    ) {
      throw new Error("Fixture should create routines with exercises");
    }

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: firstRoutine.id,
      routineName: firstRoutine.name,
      routineOrder: firstRoutine.order,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: firstExercise.id,
          exerciseId: firstExercise.exerciseId,
          sourceExerciseId: firstExercise.sourceExerciseId,
          exerciseName: firstExercise.name,
          order: firstExercise.order,
          sets: [{ setNumber: 1, loadKg: 60, reps: 8, rir: null, notes: null }],
        },
      ],
    });

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: secondRoutine.id,
      routineName: secondRoutine.name,
      routineOrder: secondRoutine.order,
      startedAt: "2026-06-16T12:00:00.000Z",
      completedAt: "2026-06-16T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: secondExercise.id,
          exerciseId: secondExercise.exerciseId,
          sourceExerciseId: secondExercise.sourceExerciseId,
          exerciseName: secondExercise.name,
          order: secondExercise.order,
          sets: [{ setNumber: 1, loadKg: 50, reps: 10, rir: null, notes: null }],
        },
      ],
    });

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: firstRoutine.id,
      routineName: firstRoutine.name,
      routineOrder: firstRoutine.order,
      startedAt: "2026-06-17T12:00:00.000Z",
      completedAt: "2026-06-17T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: firstExercise.id,
          exerciseId: firstExercise.exerciseId,
          sourceExerciseId: firstExercise.sourceExerciseId,
          exerciseName: firstExercise.name,
          order: firstExercise.order,
          sets: [{ setNumber: 1, loadKg: 62.5, reps: 8, rir: null, notes: null }],
        },
      ],
    });

    const summaries = await repository.getRoutineExecutionSummaries(
      activePlan.plan.id,
    );

    expect(summaries).toEqual([
      {
        routineId: firstRoutine.id,
        routineName: firstRoutine.name,
        routineOrder: firstRoutine.order,
        completedSessionsCount: 2,
        lastCompletedAt: "2026-06-17T13:00:00.000Z",
      },
      {
        routineId: secondRoutine.id,
        routineName: secondRoutine.name,
        routineOrder: secondRoutine.order,
        completedSessionsCount: 1,
        lastCompletedAt: "2026-06-16T13:00:00.000Z",
      },
    ]);
  });

  it("lists recent set history for an exercise with routine context", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();
    const routine = activePlan?.routines[0];
    const exercise = routine?.exercises[0];

    if (!activePlan || !routine || !exercise) {
      throw new Error("Fixture should create a routine with exercises");
    }

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: routine.id,
      routineName: routine.name,
      routineOrder: routine.order,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: exercise.id,
          exerciseId: exercise.exerciseId,
          sourceExerciseId: exercise.sourceExerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
          sets: [
            { setNumber: 1, loadKg: 60, reps: 8, rir: 2, notes: null },
          ],
        },
      ],
    });

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: routine.id,
      routineName: routine.name,
      routineOrder: routine.order,
      startedAt: "2026-06-16T12:00:00.000Z",
      completedAt: "2026-06-16T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: exercise.id,
          exerciseId: exercise.exerciseId,
          sourceExerciseId: exercise.sourceExerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
          sets: [
            { setNumber: 1, loadKg: 62.5, reps: 8, rir: 1, notes: null },
            { setNumber: 2, loadKg: 65, reps: 6, rir: 1, notes: "Pesado" },
          ],
        },
      ],
    });

    const setHistory = await repository.getExerciseSetHistory(
      exercise.exerciseId,
    );

    expect(setHistory).toMatchObject([
      {
        routineName: "Treino A",
        exerciseName: "Supino reto",
        completedAt: "2026-06-16T13:00:00.000Z",
        setNumber: 2,
        loadKg: 65,
        reps: 6,
        notes: "Pesado",
      },
      {
        routineName: "Treino A",
        exerciseName: "Supino reto",
        completedAt: "2026-06-16T13:00:00.000Z",
        setNumber: 1,
        loadKg: 62.5,
        reps: 8,
      },
      {
        routineName: "Treino A",
        exerciseName: "Supino reto",
        completedAt: "2026-06-15T13:00:00.000Z",
        setNumber: 1,
        loadKg: 60,
        reps: 8,
      },
    ]);
  });

  it("persists the Health Connect auto-export preference across repository instances", async () => {
    const databaseName = `meu-treino-test-${crypto.randomUUID()}`;
    const database = new MeuTreinoDatabase(databaseName);
    databases.push(database);
    const repository = createRepositoryFromDatabase(database);

    await expect(
      repository.getHealthConnectAutoExportEnabled(),
    ).resolves.toBe(false);

    await repository.setHealthConnectAutoExportEnabled(true);

    const reloadedDatabase = new MeuTreinoDatabase(databaseName);
    databases.push(reloadedDatabase);
    const reloadedRepository = createRepositoryFromDatabase(reloadedDatabase);

    await expect(
      reloadedRepository.getHealthConnectAutoExportEnabled(),
    ).resolves.toBe(true);
  });

  it("exports and restores a local backup with active plan, sessions and load history", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    await repository.setHealthConnectAutoExportEnabled(true);

    const activePlan = await repository.getActivePlan();
    const routine = activePlan?.routines[0];
    const exercise = routine?.exercises[0];

    if (!activePlan || !routine || !exercise) {
      throw new Error("Fixture should create a routine with exercises");
    }

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: routine.id,
      routineName: routine.name,
      routineOrder: routine.order,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: exercise.id,
          exerciseId: exercise.exerciseId,
          sourceExerciseId: exercise.sourceExerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
          sets: [
            { setNumber: 1, loadKg: 60, reps: 8, rir: null, notes: null },
            { setNumber: 2, loadKg: 62.5, reps: 7, rir: null, notes: null },
          ],
        },
      ],
    });

    const backup = await repository.exportLocalDataBackup();

    await repository.clearAllWorkoutData();
    await expect(repository.getActivePlan()).resolves.toBeNull();

    await repository.restoreLocalDataBackup(backup);

    const restoredPlan = await repository.getActivePlan();
    const restoredSessions = await repository.getRecentCompletedWorkoutSessions();
    const restoredHistory = await repository.getExerciseLoadHistory([
      exercise.exerciseId,
    ]);

    expect(restoredPlan?.plan).toMatchObject({
      id: activePlan.plan.id,
      name: "Hipertrofia 4 dias",
      isActive: true,
    });
    expect(restoredPlan?.progress).toMatchObject({
      completedSessionsCount: 1,
      lastCompletedRoutineId: routine.id,
    });
    expect(restoredSessions).toMatchObject([
      {
        routineName: routine.name,
        exercisesCount: 1,
        setsCount: 2,
      },
    ]);
    expect(restoredHistory).toEqual([
      {
        exerciseId: exercise.exerciseId,
        sourceExerciseId: exercise.sourceExerciseId,
        exerciseName: exercise.name,
        lastLoadKg: 62.5,
        maxLoadKg: 62.5,
        lastReps: 7,
        lastRir: null,
        completedSetsCount: 2,
        updatedAt: "2026-06-15T13:00:00.000Z",
      },
    ]);
    await expect(
      repository.getHealthConnectAutoExportEnabled(),
    ).resolves.toBe(true);
  });

  it("opens a pre-settings database and initializes Health Connect auto-export as disabled", async () => {
    const databaseName = `meu-treino-test-${crypto.randomUUID()}`;
    const legacyDatabase = new Dexie(databaseName);

    legacyDatabase.version(2).stores({
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

    await legacyDatabase.open();
    legacyDatabase.close();

    const migratedDatabase = new MeuTreinoDatabase(databaseName);
    databases.push(migratedDatabase);
    const repository = createRepositoryFromDatabase(migratedDatabase);

    await expect(
      repository.getHealthConnectAutoExportEnabled(),
    ).resolves.toBe(false);

    await repository.setHealthConnectAutoExportEnabled(true);

    await expect(
      repository.getHealthConnectAutoExportEnabled(),
    ).resolves.toBe(true);
  });

  it("clears plans, progress, sessions and load history", async () => {
    const repository = createRepository();

    await repository.saveActivePlan({ plan: basePlan });
    const activePlan = await repository.getActivePlan();
    const routine = activePlan?.routines[0];
    const exercise = routine?.exercises[0];

    if (!activePlan || !routine || !exercise) {
      throw new Error("Fixture should create a routine with exercises");
    }

    await repository.saveCompletedWorkoutSession({
      planId: activePlan.plan.id,
      routineId: routine.id,
      routineName: routine.name,
      routineOrder: routine.order,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: exercise.id,
          exerciseId: exercise.exerciseId,
          sourceExerciseId: exercise.sourceExerciseId,
          exerciseName: exercise.name,
          order: exercise.order,
          sets: [
            { setNumber: 1, loadKg: 60, reps: 8, rir: 2, notes: null },
          ],
        },
      ],
    });

    await repository.clearAllWorkoutData();

    await expect(repository.getActivePlan()).resolves.toBeNull();
    await expect(repository.getRecentCompletedWorkoutSessions()).resolves.toEqual(
      [],
    );
    await expect(
      repository.getExerciseLoadHistory([exercise.exerciseId]),
    ).resolves.toEqual([]);
    await expect(repository.getExerciseSetHistory(exercise.exerciseId)).resolves.toEqual(
      [],
    );
  });
});
