import { describe, expect, it } from "vitest";

import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

import { getNextRecommendedRoutineFromSnapshot } from "./workoutRecommendationService";

describe("workoutRecommendationService", () => {
  it("recommends the first routine when no workout was completed", () => {
    const recommendation = getNextRecommendedRoutineFromSnapshot(
      createSnapshot({
        lastCompletedRoutineId: null,
        lastCompletedRoutineOrder: null,
      }),
    );

    expect(recommendation).toEqual({
      routineId: "routine-a",
      routineName: "Treino A",
      routineOrder: 1,
      reason: "first-workout",
    });
  });

  it("recommends the next routine after the last completed routine", () => {
    const recommendation = getNextRecommendedRoutineFromSnapshot(
      createSnapshot({
        lastCompletedRoutineId: "routine-a",
        lastCompletedRoutineOrder: 1,
      }),
    );

    expect(recommendation).toEqual({
      routineId: "routine-b",
      routineName: "Treino B",
      routineOrder: 2,
      reason: "after-last-completed",
    });
  });

  it("restarts the cycle after the last routine", () => {
    const recommendation = getNextRecommendedRoutineFromSnapshot(
      createSnapshot({
        lastCompletedRoutineId: "routine-c",
        lastCompletedRoutineOrder: 3,
      }),
    );

    expect(recommendation).toEqual({
      routineId: "routine-a",
      routineName: "Treino A",
      routineOrder: 1,
      reason: "cycle-restarted",
    });
  });

  it("recommends the first routine when the previous routine is absent", () => {
    const recommendation = getNextRecommendedRoutineFromSnapshot(
      createSnapshot({
        lastCompletedRoutineId: "deleted-routine",
        lastCompletedRoutineOrder: 4,
      }),
    );

    expect(recommendation).toEqual({
      routineId: "routine-a",
      routineName: "Treino A",
      routineOrder: 1,
      reason: "missing-last-routine",
    });
  });
});

function createSnapshot({
  lastCompletedRoutineId,
  lastCompletedRoutineOrder,
}: {
  lastCompletedRoutineId: string | null;
  lastCompletedRoutineOrder: number | null;
}): ActiveWorkoutPlanSnapshot {
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
      createRoutine({ id: "routine-c", name: "Treino C", order: 3 }),
      createRoutine({ id: "routine-a", name: "Treino A", order: 1 }),
      createRoutine({ id: "routine-b", name: "Treino B", order: 2 }),
    ],
    progress: {
      planId: "plan-1",
      completedSessionsCount: 1,
      lastCompletedRoutineId,
      lastCompletedRoutineOrder,
      lastCompletedAt: lastCompletedRoutineId
        ? "2026-06-15T13:00:00.000Z"
        : null,
    },
  };
}

function createRoutine({
  id,
  name,
  order,
}: {
  id: string;
  name: string;
  order: number;
}): ActiveWorkoutPlanSnapshot["routines"][number] {
  return {
    id,
    planId: "plan-1",
    sourceRoutineId: id,
    name,
    order,
    warmup: [],
    exercises: [],
    cooldown: [],
  };
}
