import { describe, expect, it } from "vitest";

import { webHealthConnectAdapter } from "@/platform/health-connect";
import type { SaveCompletedWorkoutSessionInput } from "@/storage/workoutPlanRepository";

import { buildHealthConnectWorkoutExport } from "./healthConnectExportService";

describe("healthConnectExportService", () => {
  it("maps a completed workout session to a Health Connect export payload", () => {
    const payload = buildHealthConnectWorkoutExport({
      sessionId: "session-1",
      session: createCompletedSession(),
    });

    expect(payload).toEqual({
      sessionId: "session-1",
      clientRecordId: "meu-treino:workout-session:session-1",
      clientRecordVersion: new Date("2026-06-15T13:00:00.000Z").getTime(),
      title: "Treino A - Peito e triceps",
      notes: [
        "Sessao registrada no Meu Treino.",
        "Rotina: Treino A - Peito e triceps.",
        "Exercicios registrados: 2.",
        "Supino reto: 60 kg x 8 reps",
        "Triceps corda: 25 kg x 12 reps",
      ].join("\n"),
      startedAt: "2026-06-15T12:00:00.000Z",
      completedAt: "2026-06-15T13:00:00.000Z",
      exerciseType: "weightlifting",
      segments: [],
    });
  });

  it("keeps segments empty until exercise-level timestamps are reliable", () => {
    const payload = buildHealthConnectWorkoutExport({
      sessionId: "session-2",
      session: createCompletedSession({
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
                rir: null,
                notes: null,
              },
              {
                setNumber: 2,
                loadKg: 62,
                reps: 7,
                rir: null,
                notes: null,
              },
            ],
          },
        ],
      }),
    });

    expect(payload.segments).toEqual([]);
    expect(payload.notes).toContain("Supino reto: 60 kg x 8 reps; 62 kg x 7 reps");
  });

  it("rejects invalid session timestamps before export", () => {
    expect(() =>
      buildHealthConnectWorkoutExport({
        sessionId: "session-3",
        session: createCompletedSession({
          completedAt: "data-invalida",
        }),
      }),
    ).toThrow("Timestamp invalido para Health Connect: data-invalida");
  });

  it("uses a no-op PWA adapter that reports unsupported platform", async () => {
    await expect(webHealthConnectAdapter.getStatus()).resolves.toBe(
      "unsupported-platform",
    );
    await expect(webHealthConnectAdapter.requestPermissions()).resolves.toBe(
      "unsupported-platform",
    );
    await expect(
      webHealthConnectAdapter.exportWorkoutSession(
        buildHealthConnectWorkoutExport({
          sessionId: "session-1",
          session: createCompletedSession(),
        }),
      ),
    ).resolves.toEqual({
      success: false,
      message: "Health Connect esta disponivel apenas no app Android.",
    });
  });
});

function createCompletedSession(
  overrides: Partial<SaveCompletedWorkoutSessionInput> = {},
): SaveCompletedWorkoutSessionInput {
  return {
    planId: "plan-1",
    routineId: "routine-a",
    routineName: "Treino A - Peito e triceps",
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
            rir: null,
            notes: null,
          },
        ],
      },
      {
        plannedExerciseId: "planned-2",
        exerciseId: "triceps-corda",
        sourceExerciseId: "triceps-corda",
        exerciseName: "Triceps corda",
        order: 2,
        sets: [
          {
            setNumber: 1,
            loadKg: 25,
            reps: 12,
            rir: null,
            notes: null,
          },
        ],
      },
    ],
    ...overrides,
  };
}
