import { describe, expect, it, vi } from "vitest";

import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

import {
  getCycleProgressSummary,
  getExerciseLoadSummaries,
} from "./progressService";

describe("progressService", () => {
  it("calculates active plan cycle progress", () => {
    const summary = getCycleProgressSummary(createSnapshot());

    expect(summary).toEqual({
      completedSessions: 1,
      plannedSessions: 32,
      percentage: 3,
      remainingSessions: 31,
      isComplete: false,
    });
  });

  it("marks the cycle complete when completed sessions reach the plan target", () => {
    const snapshot = createSnapshot();
    snapshot.progress.completedSessionsCount = 32;

    expect(getCycleProgressSummary(snapshot)).toMatchObject({
      percentage: 100,
      remainingSessions: 0,
      isComplete: true,
    });
  });

  it("returns load summaries for exercises in the active plan", async () => {
    const repository = {
      getExerciseLoadHistory: vi.fn().mockResolvedValue([
        {
          exerciseId: "supino-reto",
          sourceExerciseId: "supino-reto",
          exerciseName: "Supino antigo",
          lastLoadKg: 62.5,
          maxLoadKg: 70,
          lastReps: 8,
          lastRir: 1,
          completedSetsCount: 12,
          updatedAt: "2026-06-15T13:00:00.000Z",
        },
      ]),
    };

    const summaries = await getExerciseLoadSummaries({
      activePlan: createSnapshot(),
      repository,
    });

    expect(repository.getExerciseLoadHistory).toHaveBeenCalledWith([
      "supino-reto",
    ]);
    expect(summaries).toEqual([
      {
        exerciseId: "supino-reto",
        exerciseName: "Supino reto",
        lastLoadKg: 62.5,
        maxLoadKg: 70,
        lastReps: 8,
        lastRir: 1,
        completedSetsCount: 12,
        updatedAt: "2026-06-15T13:00:00.000Z",
      },
    ]);
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
            sets: 3,
            target_reps: "8-10",
            order: 1,
          },
        ],
      },
    ],
    progress: {
      planId: "plan-1",
      completedSessionsCount: 1,
      lastCompletedRoutineId: "routine-a",
      lastCompletedRoutineOrder: 1,
      lastCompletedAt: "2026-06-15T13:00:00.000Z",
    },
  };
}
