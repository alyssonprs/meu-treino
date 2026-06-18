import { describe, expect, it, vi } from "vitest";

import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";

import {
  getExerciseHistoryDetails,
  getCycleProgressSummary,
  getExerciseLoadSummaries,
  getRecentCompletedWorkoutSessions,
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

  it("returns recent completed sessions from the repository", async () => {
    const repository = {
      getRecentCompletedWorkoutSessions: vi.fn().mockResolvedValue([
        {
          id: "session-2",
          planId: "plan-1",
          routineId: "routine-b",
          routineName: "Treino B",
          routineOrder: 2,
          startedAt: "2026-06-16T12:00:00.000Z",
          completedAt: "2026-06-16T13:00:00.000Z",
          status: "completed",
          exercisesCount: 3,
          setsCount: 9,
        },
      ]),
    };

    const sessions = await getRecentCompletedWorkoutSessions({
      repository,
      limit: 3,
    });

    expect(repository.getRecentCompletedWorkoutSessions).toHaveBeenCalledWith(3);
    expect(sessions).toEqual([
      {
        id: "session-2",
        routineName: "Treino B",
        completedAt: "2026-06-16T13:00:00.000Z",
        exercisesCount: 3,
        setsCount: 9,
      },
    ]);
  });

  it("returns exercise history details with active plan exercise name", async () => {
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
          updatedAt: "2026-06-16T13:00:00.000Z",
        },
      ]),
      getExerciseSetHistory: vi.fn().mockResolvedValue([
        {
          id: "set-1",
          sessionId: "session-1",
          routineName: "Treino A",
          completedAt: "2026-06-16T13:00:00.000Z",
          exerciseId: "supino-reto",
          exerciseName: "Supino antigo",
          setNumber: 1,
          loadKg: 62.5,
          reps: 8,
          rir: 1,
          notes: null,
        },
      ]),
    };

    const details = await getExerciseHistoryDetails({
      activePlan: createSnapshot(),
      exerciseId: "supino-reto",
      repository,
    });

    expect(repository.getExerciseLoadHistory).toHaveBeenCalledWith([
      "supino-reto",
    ]);
    expect(repository.getExerciseSetHistory).toHaveBeenCalledWith(
      "supino-reto",
      30,
    );
    expect(details).toEqual({
      exerciseId: "supino-reto",
      exerciseName: "Supino reto",
      lastLoadKg: 62.5,
      maxLoadKg: 70,
      lastReps: 8,
      lastRir: 1,
      completedSetsCount: 12,
      updatedAt: "2026-06-16T13:00:00.000Z",
      records: [
        {
          id: "set-1",
          sessionId: "session-1",
          routineName: "Treino A",
          completedAt: "2026-06-16T13:00:00.000Z",
          setNumber: 1,
          loadKg: 62.5,
          reps: 8,
          rir: 1,
          notes: null,
        },
      ],
    });
  });

  it("returns null when an exercise has no load history", async () => {
    const repository = {
      getExerciseLoadHistory: vi.fn().mockResolvedValue([]),
      getExerciseSetHistory: vi.fn(),
    };

    await expect(
      getExerciseHistoryDetails({
        activePlan: createSnapshot(),
        exerciseId: "supino-reto",
        repository,
      }),
    ).resolves.toBeNull();
    expect(repository.getExerciseSetHistory).not.toHaveBeenCalled();
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
