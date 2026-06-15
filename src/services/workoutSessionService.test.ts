import { describe, expect, it, vi } from "vitest";

import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

import {
  createWorkoutSessionDraft,
  finishWorkoutSession,
} from "./workoutSessionService";

describe("workoutSessionService", () => {
  it("prefills set load from previous exercise history", () => {
    const snapshot = createSnapshot();

    const draft = createWorkoutSessionDraft({
      planId: snapshot.plan.id,
      routine: snapshot.routines[0],
      startedAt: "2026-06-15T12:00:00.000Z",
      loadHistoryByExerciseId: new Map([
        [
          "supino-reto",
          {
            exerciseId: "supino-reto",
            sourceExerciseId: "supino-reto",
            exerciseName: "Supino reto",
            lastLoadKg: 62.5,
            maxLoadKg: 70,
            lastReps: 8,
            lastRir: 1,
            completedSetsCount: 6,
            updatedAt: "2026-06-14T12:00:00.000Z",
          },
        ],
      ]),
    });

    expect(draft.exercises[0].sets[0].loadKg).toBe("62.5");
    expect(draft.exercises[0].sets[0].reps).toBe("");
  });

  it("finishes a workout session with completed sets", async () => {
    const snapshot = createSnapshot();
    const draft = createWorkoutSessionDraft({
      planId: snapshot.plan.id,
      routine: snapshot.routines[0],
      startedAt: "2026-06-15T12:00:00.000Z",
    });

    draft.exercises[0].sets[0] = {
      loadKg: "60",
      reps: "8",
      rir: "2",
      notes: "Boa execucao",
    };

    const repository = {
      saveCompletedWorkoutSession: vi
        .fn()
        .mockResolvedValue({ sessionId: "session-1" }),
    };

    const result = await finishWorkoutSession({
      draft,
      completedAt: "2026-06-15T13:00:00.000Z",
      repository,
    });

    expect(result).toEqual({
      success: true,
      sessionId: "session-1",
      completedAt: "2026-06-15T13:00:00.000Z",
    });
    expect(repository.saveCompletedWorkoutSession).toHaveBeenCalledWith({
      planId: "plan-1",
      routineId: "routine-a",
      routineName: "Treino A",
      routineOrder: 1,
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exercises: [
        {
          plannedExerciseId: "planned-1",
          exerciseId: "supino-reto",
          sourceExerciseId: "supino-reto",
          exerciseName: "Supino reto",
          order: 1,
          sets: [
            {
              setNumber: 1,
              loadKg: 60,
              reps: 8,
              rir: 2,
              notes: "Boa execucao",
            },
          ],
        },
      ],
    });
  });

  it("does not finish when no set has load and reps", async () => {
    const snapshot = createSnapshot();
    const draft = createWorkoutSessionDraft({
      planId: snapshot.plan.id,
      routine: snapshot.routines[0],
      startedAt: "2026-06-15T12:00:00.000Z",
    });
    const repository = {
      saveCompletedWorkoutSession: vi.fn(),
    };

    const result = await finishWorkoutSession({
      draft,
      completedAt: "2026-06-15T13:00:00.000Z",
      repository,
    });

    expect(result).toEqual({
      success: false,
      message: "Registre carga e repeticoes em pelo menos uma serie.",
    });
    expect(repository.saveCompletedWorkoutSession).not.toHaveBeenCalled();
  });
});

function createSnapshot(): ActiveWorkoutPlanSnapshot {
  return {
    plan: {
      id: "plan-1",
      sourcePlanId: "source-plan",
      name: "Hipertrofia",
      objective: "Ganho de massa",
      level: "intermediario",
      estimatedDurationWeeks: 8,
      daysPerWeek: 4,
      isActive: true,
      importedAt: "2026-06-15T12:00:00.000Z",
    },
    routines: [
      {
        id: "routine-a",
        planId: "plan-1",
        sourceRoutineId: "treino-a",
        name: "Treino A",
        order: 1,
        warmup: [],
        cooldown: [],
        exercises: [
          {
            id: "planned-1",
            planId: "plan-1",
            routineId: "routine-a",
            exerciseId: "supino-reto",
            sourceExerciseId: "supino-reto",
            name: "Supino reto",
            muscleGroup: "Peitoral",
            equipment: "Barra",
            isUnilateral: false,
            sets: 2,
            target_reps: "8-10",
            target_rir: 2,
            order: 1,
          },
        ],
      },
    ],
    progress: {
      planId: "plan-1",
      completedSessionsCount: 0,
      lastCompletedRoutineId: null,
      lastCompletedRoutineOrder: null,
      lastCompletedAt: null,
    },
  };
}
